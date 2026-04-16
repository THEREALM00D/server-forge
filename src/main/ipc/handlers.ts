import { ipcMain, BrowserWindow, app } from "electron/main";
import { ServerManager } from "../server/ServerManager";
import { SteamCMD } from "../steamcmd/SteamCMD";
import { PalConfigParser } from "../config/PalConfigParser";
import { SystemMonitor } from "../monitor/SystemMonitor";
import { FirewallManager } from "../firewall/FirewallManager";
import { PalworldApiClient } from "../server/PalworldApiClient";
import { BackupManager } from "../backup/BackupManager";
import Store from "electron-store";

export function registerIpcHandlers(): void {
  const store = new Store<{
    serverPath: string;
    serverArgs: string[];
    autoRestart: boolean;
    backupDir: string;
    backupKeep: number;
    backupIntervalMinutes: number;
  }>();

  const serverManager = new ServerManager();
  const steamcmd = new SteamCMD();
  const configParser = new PalConfigParser();
  const systemMonitor = new SystemMonitor();
  const firewall = new FirewallManager();
  const backup = new BackupManager();

  const getBackupDir = (): string => {
    const stored = store.get("backupDir", "");
    return stored || backup.getDefaultBackupDir(app.getPath("userData"));
  };

  const runScheduledBackup = async (): Promise<void> => {
    if (serverManager.getStatus() !== "running") return;
    const serverPath = store.get("serverPath", "");
    if (!serverPath) return;
    const dir = getBackupDir();
    await backup.create(serverPath, dir);
    backup.rotate(dir, store.get("backupKeep", 10));
  };

  const applyScheduler = (): void => {
    const minutes = store.get("backupIntervalMinutes", 0);
    backup.startScheduler(minutes, runScheduledBackup);
  };

  applyScheduler();
  // --- Window controls ---
  ipcMain.handle("window:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("window:maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.handle("window:close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  // --- App config (persisted) ---
  ipcMain.handle("config:getServerPath", () => store.get("serverPath", ""));
  ipcMain.handle("config:setServerPath", (_, path: string) =>
    store.set("serverPath", path),
  );

  // --- SteamCMD / Installation ---
  ipcMain.handle("steamcmd:isInstalled", () => steamcmd.isInstalled());
  ipcMain.handle("steamcmd:install", async (event) => {
    return steamcmd.install((progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });
  ipcMain.handle(
    "steamcmd:installPalworld",
    async (event, installPath: string) => {
      store.set("serverPath", installPath);
      return steamcmd.installPalworld(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );
  ipcMain.handle("steamcmd:updatePalworld", async (event) => {
    const installPath = store.get("serverPath", "");
    return steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });
  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = store.get("serverPath", "");
    return steamcmd.checkForUpdate(installPath);
  });

  // --- Server controls ---
  ipcMain.handle("server:start", async (event) => {
    const serverPath = store.get("serverPath", "");
    const args = store.get("serverArgs", []);
    return serverManager.start(serverPath, args, (line) => {
      event.sender.send("server:log", line);
    });
  });
  const getApiClient = (): PalworldApiClient | null => {
    const serverPath = store.get("serverPath", "");
    const cfg = configParser.read(serverPath);
    if (!cfg.RESTAPIEnabled) return null;
    return new PalworldApiClient(
      Number(cfg.RESTAPIPort ?? 8212),
      String(cfg.AdminPassword ?? ""),
    );
  };

  const getStopConfig = () => {
    const serverPath = store.get("serverPath", "");
    const cfg = configParser.read(serverPath);
    return {
      restApiEnabled: cfg.RESTAPIEnabled === true,
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
      adminPassword: String(cfg.AdminPassword ?? ""),
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  };

  ipcMain.handle("server:stop", () => serverManager.stop(getStopConfig()));
  ipcMain.handle("server:restart", async (event) => {
    const serverPath = store.get("serverPath", "");
    const args = store.get("serverArgs", []);
    return serverManager.restart(
      serverPath,
      args,
      (line) => {
        event.sender.send("server:log", line);
      },
      getStopConfig(),
    );
  });
  ipcMain.handle("server:status", () => serverManager.getStatus());

  // --- Palworld config (.ini) ---
  ipcMain.handle("palconfig:read", async () => {
    const serverPath = store.get("serverPath", "");
    return configParser.read(serverPath);
  });
  ipcMain.handle(
    "palconfig:write",
    async (_, settings: Record<string, string | number | boolean>) => {
      const serverPath = store.get("serverPath", "");
      return configParser.write(serverPath, settings);
    },
  );

  // --- System monitoring ---
  ipcMain.handle("monitor:getStats", () => systemMonitor.getStats());
  ipcMain.handle("monitor:startPolling", (event) => {
    systemMonitor.startPolling(2000, (stats) => {
      event.sender.send("monitor:stats", stats);
    });
  });
  ipcMain.handle("monitor:stopPolling", () => systemMonitor.stopPolling());

  // --- Dialog (folder picker) ---
  ipcMain.handle("dialog:selectFolder", async () => {
    const { dialog } = await import("electron/main");
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // --- Firewall ---
  ipcMain.handle("firewall:isAdmin", () => firewall.isAdmin());
  ipcMain.handle(
    "firewall:getStatus",
    (_, gamePort: number, rconPort: number, restApiPort: number) =>
      firewall.getStatus(gamePort, rconPort, restApiPort),
  );
  ipcMain.handle(
    "firewall:enableRule",
    (
      _,
      key: "game" | "rcon" | "restapi",
      port: number,
      protocol: "TCP" | "UDP",
    ) => firewall.enableRule(key, port, protocol),
  );
  ipcMain.handle(
    "firewall:disableRule",
    (_, key: "game" | "rcon" | "restapi") => firewall.disableRule(key),
  );
  ipcMain.handle(
    "firewall:applyAll",
    (_, gamePort: number, rconPort: number, restApiPort: number) =>
      firewall.applyAll(gamePort, rconPort, restApiPort),
  );
  ipcMain.handle("firewall:removeAll", () => firewall.removeAll());
  ipcMain.handle("firewall:listCustomRules", () => firewall.listCustomRules());
  ipcMain.handle(
    "firewall:createCustomRule",
    (_, name: string, port: number, protocol: "TCP" | "UDP") =>
      firewall.createCustomRule(name, port, protocol),
  );
  ipcMain.handle(
    "firewall:deleteCustomRule",
    (_, name: string, protocol: "TCP" | "UDP") =>
      firewall.deleteCustomRule(name, protocol),
  );

  // --- Palworld REST API ---
  ipcMain.handle("palapi:getInfo", () => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.getInfo();
  });
  ipcMain.handle("palapi:getPlayers", () => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.getPlayers();
  });
  ipcMain.handle("palapi:getMetrics", () => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.getMetrics();
  });
  ipcMain.handle("palapi:announce", (_, message: string) => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.announce(message);
  });
  ipcMain.handle("palapi:kick", (_, userid: string, message?: string) => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.kick(userid, message);
  });
  ipcMain.handle("palapi:ban", (_, userid: string, message?: string) => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.ban(userid, message);
  });
  ipcMain.handle("palapi:unban", (_, userid: string) => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.unban(userid);
  });
  ipcMain.handle("palapi:shutdown", (_, waittime: number, message?: string) => {
    const client = getApiClient();
    if (!client) throw new Error("REST API non configurée");
    return client.shutdown(waittime, message);
  });

  // --- Backups ---
  ipcMain.handle("backup:getConfig", () => ({
    backupDir: getBackupDir(),
    backupKeep: store.get("backupKeep", 10),
    backupIntervalMinutes: store.get("backupIntervalMinutes", 0),
  }));
  ipcMain.handle(
    "backup:setConfig",
    (
      _,
      cfg: {
        backupDir: string;
        backupKeep: number;
        backupIntervalMinutes: number;
      },
    ) => {
      store.set("backupDir", cfg.backupDir);
      store.set("backupKeep", cfg.backupKeep);
      store.set("backupIntervalMinutes", cfg.backupIntervalMinutes);
      applyScheduler();
    },
  );
  ipcMain.handle("backup:list", () => backup.list(getBackupDir()));
  ipcMain.handle("backup:create", async () => {
    const serverPath = store.get("serverPath", "");
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    const dir = getBackupDir();
    const entry = await backup.create(serverPath, dir);
    backup.rotate(dir, store.get("backupKeep", 10));
    return entry;
  });
  ipcMain.handle("backup:restore", async (_, backupPath: string) => {
    const serverPath = store.get("serverPath", "");
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    if (serverManager.getStatus() === "running") {
      throw new Error("Arrêtez le serveur avant de restaurer une sauvegarde");
    }
    await backup.restore(serverPath, backupPath);
  });
  ipcMain.handle("backup:delete", (_, backupPath: string) => {
    backup.delete(backupPath);
  });

  // --- App info ---
  ipcMain.handle("app:getVersion", () => app.getVersion());
}
