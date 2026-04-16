interface SystemStats {
  cpu: number;
  ram: number;
  ramUsed: number;
  ramTotal: number;
  uptime: number;
}

interface PalServerInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

interface PalPlayer {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

interface BackupEntry {
  name: string;
  path: string;
  size: number;
  createdAt: number;
}

interface RestartConfig {
  enabled: boolean;
  time: string;
  warningMinutes: number;
  message: string;
}

interface BackupConfig {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

interface PalMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}

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
  steamcmd: {
    isInstalled: () => Promise<boolean>;
    install: () => Promise<{ success: boolean; error?: string }>;
    installPalworld: (
      path: string,
    ) => Promise<{ success: boolean; error?: string }>;
    updatePalworld: () => Promise<{ success: boolean; error?: string }>;
    checkForUpdate: () => Promise<{
      upToDate: boolean;
      installedBuild: string | null;
      requiredBuild: string | null;
    }>;
    onProgress: (cb: (msg: string) => void) => () => void;
  };
  server: {
    start: () => Promise<{ success: boolean; error?: string }>;
    stop: () => Promise<{ success: boolean; error?: string }>;
    restart: () => Promise<{ success: boolean; error?: string }>;
    getStatus: () => Promise<string>;
    onLog: (cb: (line: string) => void) => () => void;
  };
  palconfig: {
    read: () => Promise<Record<string, string | number | boolean>>;
    write: (
      settings: Record<string, unknown>,
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
    ) => Promise<
      Array<{
        name: string;
        port: number;
        protocol: "TCP" | "UDP";
        active: boolean;
      }>
    >;
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
    listCustomRules: () => Promise<
      Array<{
        name: string;
        port: number;
        protocol: "TCP" | "UDP";
        active: boolean;
      }>
    >;
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
  dialog: {
    selectFolder: () => Promise<string | null>;
  };
  app: {
    getVersion: () => Promise<string>;
  };
}

interface Window {
  api: API;
}
