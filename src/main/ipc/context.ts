import type { BrowserWindow, App } from "electron";
import type { ServerManager } from "../server/ServerManager";
import type { SteamCMD } from "../steamcmd/SteamCMD";
import type { PalConfigParser } from "../config/PalConfigParser";
import type { SystemMonitor } from "../monitor/SystemMonitor";
import type { FirewallManager } from "../firewall/FirewallManager";
import type { BackupManager } from "../backup/BackupManager";
import type { RestartScheduler } from "../scheduler/RestartScheduler";
import type { PlayerHistoryTracker } from "../players/PlayerHistoryTracker";
import type Store from "electron-store";
import type {
  RestartConfig,
  LaunchArgsConfig,
  Server,
} from "../../shared/types";

export interface AppStore {
  // Legacy : utilisé pour la migration vers `servers`. Ne plus lire/écrire directement —
  // passer par getActiveServer() / getActiveServerPath() dans IpcContext.
  serverPath?: string;

  // Multi-serveur (Phase 1) : liste + serveur actif
  servers: Server[];
  activeServerId: string | null;

  launchArgs: LaunchArgsConfig;
  autoRestart: boolean;
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
  restartSchedule: RestartConfig;
}

export interface IpcContext {
  app: App;
  store: Store<AppStore>;
  serverManager: ServerManager;
  steamcmd: SteamCMD;
  configParser: PalConfigParser;
  systemMonitor: SystemMonitor;
  firewall: FirewallManager;
  backup: BackupManager;
  restartScheduler: RestartScheduler;
  playerHistory: PlayerHistoryTracker;
  broadcastLog: (line: string) => void;
  getBackupDir: () => string;
  getRestartConfig: () => RestartConfig;
  applyBackupScheduler: () => void;
  getStopConfig: () => {
    restApiEnabled: boolean;
    restApiPort: number;
    adminPassword: string;
    shutdownWaittime: number;
    shutdownMessage: string;
  };
  // Multi-serveur : helpers pour récupérer le serveur actif. Tous les handlers
  // qui parlent "du serveur" doivent passer par ces helpers, jamais lire
  // serverPath directement du store.
  getActiveServer: () => Server | null;
  getActiveServerPath: () => string;
  // Met à jour le path du serveur actif (legacy compat : steamcmd/misc setServerPath).
  // Si aucun serveur n'existe encore, en crée un avec ce path.
  setActiveServerPath: (path: string) => void;
}

export type BrowserWindowModule = typeof BrowserWindow;
