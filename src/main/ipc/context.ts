import type { BrowserWindow, App } from "electron";
import type { ServerManager } from "../server/ServerManager";
import type { SteamCMD } from "../steamcmd/SteamCMD";
import type { PalConfigParser } from "../config/PalConfigParser";
import type { SystemMonitor } from "../monitor/SystemMonitor";
import type { FirewallManager } from "../firewall/FirewallManager";
import type { BackupManager } from "../backup/BackupManager";
import type { RestartScheduler } from "../scheduler/RestartScheduler";
import type { ServerManagerRegistry } from "../servers/ServerManagerRegistry";
import type { PlayerHistoryRegistry } from "../servers/PlayerHistoryRegistry";
import type Store from "electron-store";
import type {
  RestartConfig,
  LaunchArgsConfig,
  Server,
  ServerConfig,
} from "../../shared/types";

export interface AppStore {
  // Legacy globaux (Phase 1) : utilisés pour la migration vers serversConfig.
  // Plus lus directement après migration — passer par ctx.getServerConfig().
  serverPath?: string;
  launchArgs?: LaunchArgsConfig;
  autoRestart?: boolean;
  backupDir?: string;
  backupKeep?: number;
  backupIntervalMinutes?: number;
  restartSchedule?: RestartConfig;

  // Multi-serveur : liste + serveur actif + config par-serveur (Phase 2a)
  servers: Server[];
  activeServerId: string | null;
  serversConfig: Record<string, ServerConfig>;
}

export interface IpcContext {
  app: App;
  store: Store<AppStore>;
  serverManagers: ServerManagerRegistry;
  /**
   * Helper compat : retourne le ServerManager du serveur actif, ou lance si
   * aucun serveur n'est sélectionné. Évite de mettre `null` partout dans les
   * handlers qui supposaient déjà un serveur unique.
   */
  requireActiveManager: () => ServerManager;
  steamcmd: SteamCMD;
  configParser: PalConfigParser;
  systemMonitor: SystemMonitor;
  firewall: FirewallManager;
  backup: BackupManager;
  restartScheduler: RestartScheduler;
  playerHistories: PlayerHistoryRegistry;
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

  // Accès à la config par-serveur (Phase 2a).
  // `serverId` est optionnel : par défaut, le serveur actif.
  getServerConfig: (serverId?: string) => ServerConfig;
  updateServerConfig: (
    serverId: string | undefined,
    patch: Partial<ServerConfig>,
  ) => ServerConfig;
  /** Supprime la config stockée d'un serveur (sans toucher au filesystem). */
  removeServerConfig: (serverId: string) => void;
}

export type BrowserWindowModule = typeof BrowserWindow;
