import type { BrowserWindow, App } from "electron";
import type { ServerManager } from "../server/ServerManager";
import type { SteamCMD } from "../steamcmd/SteamCMD";
import type { PalConfigParser } from "../config/PalConfigParser";
import type { SystemMonitor } from "../monitor/SystemMonitor";
import type { FirewallManager } from "../firewall/FirewallManager";
import type { BackupManager } from "../backup/BackupManager";
import type { RestartScheduler } from "../scheduler/RestartScheduler";
import type Store from "electron-store";
import type { RestartConfig, LaunchArgsConfig } from "../../shared/types";

export interface AppStore {
  serverPath: string;
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
}

export type BrowserWindowModule = typeof BrowserWindow;
