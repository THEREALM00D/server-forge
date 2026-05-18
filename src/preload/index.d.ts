import type {
  SystemStats,
  PalServerInfo,
  PalPlayer,
  PalMetrics,
  BackupEntry,
  BackupConfig,
  RestartConfig,
  FirewallRuleStatus,
  UpdateCheckResult,
  LaunchArgsConfig,
  PlayerHistoryEntry,
  Server,
  GameType,
  ServerStatus,
  ServerLogEvent,
} from "../shared/types";

interface API {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  config: {
    getServerPath: () => Promise<string>;
    setServerPath: (path: string) => Promise<void>;
  };
  servers: {
    list: () => Promise<Server[]>;
    getActive: () => Promise<Server | null>;
    setActive: (id: string | null) => Promise<void>;
    create: (input: {
      name: string;
      path: string;
      gameType?: GameType;
      color?: string | null;
    }) => Promise<Server>;
    update: (
      id: string,
      patch: Partial<{
        name: string;
        path: string;
        gameType: GameType;
        color: string | null;
      }>,
    ) => Promise<Server>;
    delete: (id: string) => Promise<void>;
  };
  steamcmd: {
    isInstalled: () => Promise<boolean>;
    install: () => Promise<{ success: boolean; error?: string }>;
    installPalworld: (
      path: string,
    ) => Promise<{ success: boolean; error?: string }>;
    updatePalworld: () => Promise<{ success: boolean; error?: string }>;
    checkForUpdate: () => Promise<UpdateCheckResult>;
    onProgress: (cb: (msg: string) => void) => () => void;
  };
  server: {
    start: (serverId?: string) => Promise<{ success: boolean; error?: string }>;
    stop: (serverId?: string) => Promise<{ success: boolean; error?: string }>;
    restart: (
      serverId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
    getStatus: () => Promise<ServerStatus>;
    getStatuses: () => Promise<Record<string, ServerStatus>>;
    getLaunchArgs: (serverId?: string) => Promise<LaunchArgsConfig>;
    setLaunchArgs: (cfg: LaunchArgsConfig, serverId?: string) => Promise<void>;
    onLog: (cb: (event: ServerLogEvent) => void) => () => void;
  };
  palconfig: {
    read: (
      serverId?: string,
    ) => Promise<Record<string, string | number | boolean>>;
    write: (
      settings: Record<string, unknown>,
      serverId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  monitor: {
    getStats: () => Promise<SystemStats>;
    startPolling: () => Promise<void>;
    stopPolling: () => Promise<void>;
    onStats: (cb: (stats: SystemStats) => void) => () => void;
  };
  firewall: {
    isAdmin: () => Promise<boolean>;
    getStatus: (
      gamePort: number,
      rconPort: number,
      restApiPort: number,
    ) => Promise<FirewallRuleStatus[]>;
    enableRule: (
      key: "game" | "rcon" | "restapi",
      port: number,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
    disableRule: (
      key: "game" | "rcon" | "restapi",
    ) => Promise<{ success: boolean; error?: string }>;
    applyAll: (
      gamePort: number,
      rconPort: number,
      restApiPort: number,
    ) => Promise<{ success: boolean; errors: string[] }>;
    removeAll: () => Promise<void>;
    listCustomRules: () => Promise<FirewallRuleStatus[]>;
    createCustomRule: (
      name: string,
      port: number,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
    deleteCustomRule: (
      name: string,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
  };
  palapi: {
    getInfo: () => Promise<PalServerInfo>;
    getPlayers: () => Promise<{ players: PalPlayer[] }>;
    getMetrics: () => Promise<PalMetrics>;
    announce: (message: string) => Promise<void>;
    kick: (userid: string, message?: string) => Promise<void>;
    ban: (userid: string, message?: string) => Promise<void>;
    unban: (userid: string) => Promise<void>;
    shutdown: (waittime: number, message?: string) => Promise<void>;
  };
  players: {
    getHistory: () => Promise<PlayerHistoryEntry[]>;
    clearHistory: () => Promise<void>;
    removeEntry: (userId: string) => Promise<void>;
  };
  backup: {
    getConfig: () => Promise<BackupConfig>;
    setConfig: (cfg: BackupConfig) => Promise<void>;
    list: () => Promise<BackupEntry[]>;
    create: () => Promise<BackupEntry>;
    restore: (backupPath: string) => Promise<void>;
    delete: (backupPath: string) => Promise<void>;
  };
  schedule: {
    getRestart: () => Promise<RestartConfig>;
    setRestart: (cfg: RestartConfig) => Promise<void>;
  };
  shell: {
    openPath: (path: string) => Promise<void>;
  };
  dialog: {
    selectFolder: () => Promise<string | null>;
  };
  app: {
    getVersion: () => Promise<string>;
  };
}

declare global {
  interface Window {
    api: API;
  }
}

export {};
