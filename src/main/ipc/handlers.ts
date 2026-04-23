import { BrowserWindow, app } from "electron/main";
import Store from "electron-store";
import { ServerManager } from "../server/ServerManager";
import { SteamCMD } from "../steamcmd/SteamCMD";
import { PalConfigParser } from "../config/PalConfigParser";
import { SystemMonitor } from "../monitor/SystemMonitor";
import { FirewallManager } from "../firewall/FirewallManager";
import { BackupManager } from "../backup/BackupManager";
import { RestartScheduler } from "../scheduler/RestartScheduler";
import type { RestartConfig } from "../../shared/types";
import type { AppStore, IpcContext } from "./context";
import { registerMiscHandlers } from "./handlers/misc";
import { registerSteamHandlers } from "./handlers/steam";
import { registerServerHandlers, buildServerArgs } from "./handlers/server";
import { registerPalapiHandlers } from "./handlers/palapi";
import { registerFirewallHandlers } from "./handlers/firewall";
import { registerBackupHandlers } from "./handlers/backup";
import { registerScheduleHandlers } from "./handlers/schedule";

const DEFAULT_RESTART_CONFIG: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
};

export function registerIpcHandlers(): void {
  const store = new Store<AppStore>();

  const serverManager = new ServerManager();
  const steamcmd = new SteamCMD();
  const configParser = new PalConfigParser();
  const systemMonitor = new SystemMonitor();
  const firewall = new FirewallManager();
  const backup = new BackupManager();
  const restartScheduler = new RestartScheduler();

  const broadcastLog = (line: string): void => {
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("server:log", line),
    );
  };

  const getBackupDir = (): string => {
    const stored = store.get("backupDir", "");
    return stored || backup.getDefaultBackupDir(app.getPath("userData"));
  };

  const getRestartConfig = (): RestartConfig =>
    store.get("restartSchedule", DEFAULT_RESTART_CONFIG);

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

  const getStopConfigForRestart = () => {
    const base = getStopConfig();
    const restart = getRestartConfig();
    return {
      ...base,
      shutdownWaittime: restart.warningMinutes * 60,
      shutdownMessage: restart.message.replace(
        "{minutes}",
        String(restart.warningMinutes),
      ),
    };
  };

  const applyBackupScheduler = (): void => {
    const minutes = store.get("backupIntervalMinutes", 0);
    backup.startScheduler(minutes, async () => {
      if (serverManager.getStatus() !== "running") return;
      const serverPath = store.get("serverPath", "");
      if (!serverPath) return;
      const dir = getBackupDir();
      await backup.create(serverPath, dir);
      backup.rotate(dir, store.get("backupKeep", 10));
    });
  };

  // Start daily restart scheduler
  restartScheduler.start(getRestartConfig, async () => {
    if (serverManager.getStatus() !== "running") return;
    await serverManager.restart(
      store.get("serverPath", ""),
      buildServerArgs(store),
      () => {},
      getStopConfigForRestart(),
    );
  });

  applyBackupScheduler();

  // Try to adopt an existing PalServer.exe on startup
  serverManager.tryAdopt(broadcastLog).catch(() => {});

  const ctx: IpcContext = {
    app,
    store,
    serverManager,
    steamcmd,
    configParser,
    systemMonitor,
    firewall,
    backup,
    restartScheduler,
    broadcastLog,
    getBackupDir,
    getRestartConfig,
    applyBackupScheduler,
    getStopConfig,
  };

  registerMiscHandlers(ctx);
  registerSteamHandlers(ctx);
  registerServerHandlers(ctx);
  registerPalapiHandlers(ctx);
  registerFirewallHandlers(ctx);
  registerBackupHandlers(ctx);
  registerScheduleHandlers(ctx);
}
