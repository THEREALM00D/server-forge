import type Store from "electron-store";
import type {
  BackupConfig,
  LaunchArgsConfig,
  RestartConfig,
  ServerConfig,
} from "../../shared/types";
import type { AppStore } from "../ipc/context";

const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

const DEFAULT_BACKUP: BackupConfig = {
  backupDir: "",
  backupKeep: 10,
  backupIntervalMinutes: 0,
};

const DEFAULT_RESTART: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  launchArgs: DEFAULT_LAUNCH_ARGS,
  backup: DEFAULT_BACKUP,
  restart: DEFAULT_RESTART,
};

export class ServerConfigStore {
  constructor(private store: Store<AppStore>) {}

  get(serverId: string): ServerConfig {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    const existing = all[serverId];
    if (!existing) return DEFAULT_SERVER_CONFIG;
    return {
      launchArgs: { ...DEFAULT_LAUNCH_ARGS, ...existing.launchArgs },
      backup: { ...DEFAULT_BACKUP, ...existing.backup },
      restart: { ...DEFAULT_RESTART, ...existing.restart },
    };
  }

  update(serverId: string, patch: Partial<ServerConfig>): ServerConfig {
    const current = this.get(serverId);
    const next: ServerConfig = {
      launchArgs: { ...current.launchArgs, ...patch.launchArgs },
      backup: { ...current.backup, ...patch.backup },
      restart: { ...current.restart, ...patch.restart },
    };
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    this.store.set("serversConfig", { ...all, [serverId]: next });
    return next;
  }

  remove(serverId: string): void {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    if (!(serverId in all)) return;
    const next = { ...all };
    delete next[serverId];
    this.store.set("serversConfig", next);
  }

  /**
   * Migre les anciennes configs globales (launchArgs/backup/restartSchedule) vers
   * la config du premier serveur. No-op si déjà migré ou pas de legacy.
   * Appelé une fois au boot, après ServerRegistry.migrateLegacy().
   */
  migrateLegacy(firstServerId: string): void {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    if (all[firstServerId]) return; // déjà migré

    const legacy: ServerConfig = {
      launchArgs: this.store.get("launchArgs", DEFAULT_LAUNCH_ARGS),
      backup: {
        backupDir: this.store.get("backupDir", ""),
        backupKeep: this.store.get("backupKeep", 10),
        backupIntervalMinutes: this.store.get("backupIntervalMinutes", 0),
      },
      restart: this.store.get("restartSchedule", DEFAULT_RESTART),
    };
    this.store.set("serversConfig", { ...all, [firstServerId]: legacy });
  }
}
