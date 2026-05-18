import { BrowserWindow, app } from "electron/main";
import Store from "electron-store";
import { SteamCMD } from "../steamcmd/SteamCMD";
import { PalConfigParser } from "../config/PalConfigParser";
import { SystemMonitor } from "../monitor/SystemMonitor";
import { FirewallManager } from "../firewall/FirewallManager";
import { BackupManager } from "../backup/BackupManager";
import { RestartScheduler } from "../scheduler/RestartScheduler";
import { PalworldApiClient } from "../server/PalworldApiClient";
import { ServerRegistry } from "../servers/ServerRegistry";
import { ServerConfigStore } from "../servers/ServerConfigStore";
import { ServerManagerRegistry } from "../servers/ServerManagerRegistry";
import { PlayerHistoryRegistry } from "../servers/PlayerHistoryRegistry";
import type { RestartConfig } from "../../shared/types";
import type { AppStore, IpcContext } from "./context";
import { registerMiscHandlers } from "./handlers/misc";
import { registerSteamHandlers } from "./handlers/steam";
import { registerServerHandlers, buildServerArgs } from "./handlers/server";
import { registerPalapiHandlers } from "./handlers/palapi";
import { registerFirewallHandlers } from "./handlers/firewall";
import { registerBackupHandlers } from "./handlers/backup";
import { registerScheduleHandlers } from "./handlers/schedule";
import { registerPlayersHandlers } from "./handlers/players";
import { registerServersHandlers } from "./handlers/servers";

const DEFAULT_RESTART_CONFIG: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
};

export function registerIpcHandlers(): void {
  const store = new Store<AppStore>();
  const servers = new ServerRegistry(store);
  const serverConfigs = new ServerConfigStore(store);

  // Phase 1 multi-serveur : migre l'ancien `serverPath` unique en premier
  // entry de la liste. No-op si déjà migré ou si pas de legacy à migrer.
  const migrated = servers.migrateLegacy();
  // Phase 2a : migre les anciennes configs globales (launchArgs / backup* /
  // restartSchedule) vers la config du premier serveur. Idempotent.
  const firstServer = migrated ?? servers.list()[0];
  if (firstServer) serverConfigs.migrateLegacy(firstServer.id);

  // Helpers utilisés partout : centralisent la résolution du serveur "actif".
  // Tant qu'on n'a pas la Phase 2 (handlers paramétrés par serverId), tout le
  // backend continue de fonctionner sur l'unique serveur actif.
  const getActiveServer = () => servers.getActive();
  const getActiveServerPath = (): string => getActiveServer()?.path ?? "";
  const setActiveServerPath = (path: string): void => {
    const active = servers.getActive();
    if (active) {
      servers.update(active.id, { path });
    } else {
      // Premier lancement / app fresh : on crée un serveur avec ce path.
      servers.create({ name: "", path, gameType: "palworld" });
    }
    // On garde aussi `serverPath` en sync pour la rétrocompat (handlers pas
    // encore migrés, ou versions précédentes installées en dual-boot).
    store.set("serverPath", path);
  };

  // Phase 2a : helpers pour la config par-serveur.
  const resolveServerId = (id: string | undefined): string => {
    const resolved = id ?? servers.getActiveId();
    if (!resolved) throw new Error("Aucun serveur actif configuré");
    return resolved;
  };
  const getServerConfig = (id?: string) =>
    serverConfigs.get(resolveServerId(id));
  const updateServerConfig = (
    id: string | undefined,
    patch: Parameters<typeof serverConfigs.update>[1],
  ) => serverConfigs.update(resolveServerId(id), patch);

  const serverManagers = new ServerManagerRegistry(servers);
  const requireActiveManager = () => {
    const mgr = serverManagers.getActive();
    if (!mgr) throw new Error("Aucun serveur actif configuré");
    return mgr;
  };
  // Helper local pour les boucles internes : retourne le manager actif ou
  // null (sans throw). Utilisé par les schedulers / poller qui doivent juste
  // skipper si aucun serveur n'est sélectionné.
  const activeManagerOrNull = () => serverManagers.getActive();

  const steamcmd = new SteamCMD();
  const configParser = new PalConfigParser();
  const systemMonitor = new SystemMonitor();
  const firewall = new FirewallManager();
  const backup = new BackupManager();
  const restartScheduler = new RestartScheduler();
  const playerHistories = new PlayerHistoryRegistry(
    app.getPath("userData"),
    servers,
  );
  // Phase 2c : migre l'ancien history.json partagé vers le premier serveur
  if (firstServer) playerHistories.migrateLegacy(firstServer.id);

  const broadcastLog = (line: string): void => {
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("server:log", line),
    );
  };

  const getBackupDir = (): string => {
    const active = servers.getActive();
    if (!active) return backup.getDefaultBackupDir(app.getPath("userData"));
    const stored = serverConfigs.get(active.id).backup.backupDir;
    return (
      stored ||
      backup.getDefaultBackupDirForServer(app.getPath("userData"), active.id)
    );
  };

  const getRestartConfig = (): RestartConfig => {
    const active = servers.getActive();
    if (!active) return DEFAULT_RESTART_CONFIG;
    return serverConfigs.get(active.id).restart;
  };

  const getStopConfig = () => {
    const serverPath = getActiveServerPath();
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
    const active = servers.getActive();
    const cfg = active ? serverConfigs.get(active.id).backup : null;
    const minutes = cfg?.backupIntervalMinutes ?? 0;
    backup.startScheduler(minutes, async () => {
      const mgr = activeManagerOrNull();
      if (!mgr || mgr.getStatus() !== "running") return;
      const serverPath = getActiveServerPath();
      if (!serverPath) return;
      const dir = getBackupDir();
      await backup.create(serverPath, dir);
      backup.rotate(dir, cfg?.backupKeep ?? 10);
    });
  };

  // Start daily restart scheduler
  restartScheduler.start(getRestartConfig, async () => {
    const mgr = activeManagerOrNull();
    if (!mgr || mgr.getStatus() !== "running") return;
    const active = servers.getActive();
    const launchArgs = active
      ? serverConfigs.get(active.id).launchArgs
      : { publicLobby: false, performanceFlags: false, customArgs: "" };
    await mgr.restart(
      getActiveServerPath(),
      buildServerArgs(launchArgs),
      () => {},
      getStopConfigForRestart(),
    );
  });

  applyBackupScheduler();

  // Tracker d'historique : démarre quand l'API REST est dispo, s'arrête sinon
  const getApiClientForHistory = () => {
    const mgr = activeManagerOrNull();
    if (!mgr || mgr.getStatus() !== "running") return null;
    const serverPath = getActiveServerPath();
    if (!serverPath) return null;
    try {
      const cfg = configParser.read(serverPath);
      if (!cfg.RESTAPIEnabled) return null;
      return new PalworldApiClient(
        Number(cfg.RESTAPIPort ?? 8212),
        String(cfg.AdminPassword ?? ""),
      );
    } catch {
      return null;
    }
  };

  let lastTrackerActive = false;
  setInterval(() => {
    const mgr = activeManagerOrNull();
    const tracker = playerHistories.getActive();
    const shouldTrack = !!mgr && !!tracker && mgr.getStatus() === "running";
    if (shouldTrack && !lastTrackerActive) {
      tracker!.start(getApiClientForHistory);
      lastTrackerActive = true;
    } else if (!shouldTrack && lastTrackerActive) {
      playerHistories.stopAll();
      lastTrackerActive = false;
    }
  }, 5000);

  // Try to adopt any existing PalServer.exe processes on startup, matching
  // each running process to a configured server by executable path.
  serverManagers.tryAdoptAll(broadcastLog).catch(() => {});

  const ctx: IpcContext = {
    app,
    store,
    serverManagers,
    requireActiveManager,
    steamcmd,
    configParser,
    systemMonitor,
    firewall,
    backup,
    restartScheduler,
    playerHistories,
    broadcastLog,
    getBackupDir,
    getRestartConfig,
    applyBackupScheduler,
    getStopConfig,
    getActiveServer,
    getActiveServerPath,
    setActiveServerPath,
    getServerConfig,
    updateServerConfig,
  };

  registerMiscHandlers(ctx);
  registerSteamHandlers(ctx);
  registerServerHandlers(ctx);
  registerPalapiHandlers(ctx);
  registerFirewallHandlers(ctx);
  registerBackupHandlers(ctx);
  registerScheduleHandlers(ctx);
  registerPlayersHandlers(ctx);
  registerServersHandlers(ctx, servers);
}
