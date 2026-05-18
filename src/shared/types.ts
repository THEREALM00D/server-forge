// Types partagés entre main, preload et renderer.
// Tout ce qui transite via IPC doit avoir le même type des deux côtés.

// --- Serveurs ---
// Pour l'instant uniquement "palworld" ; prévu pour s'étendre à d'autres jeux.
export type GameType = "palworld";

export interface Server {
  id: string;
  name: string;
  gameType: GameType;
  path: string;
  color: string | null;
  createdAt: number;
}

// Configuration par-serveur (launch args, backup, restart) — stockée séparément
// de `Server` pour garder le type Server simple et pouvoir hot-reload la config
// sans toucher au serveur lui-même.
export interface ServerConfig {
  launchArgs: LaunchArgsConfig;
  backup: BackupConfig;
  restart: RestartConfig;
}

export interface SystemStats {
  cpu: number; // %
  ram: number; // %
  ramUsed: number; // GB
  ramTotal: number; // GB
  ramUsedByGame: number; // GB
  serverUptime: number; // seconds
  uptime: number; // seconds
}

export type ServerStatus =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "crashed";

// --- Palworld REST API ---
export interface PalServerInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

export interface PalPlayer {
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

export interface PalMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}

// --- Backups ---
export interface BackupEntry {
  name: string;
  path: string;
  size: number;
  createdAt: number;
}

export interface BackupConfig {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

// --- Scheduler ---
export interface RestartConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
  warningMinutes: number;
  message: string;
}

// --- Firewall ---
export interface FirewallRuleStatus {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
  active: boolean;
}

// --- Update check ---
export interface UpdateCheckResult {
  upToDate: boolean;
  installedBuild: string | null;
  requiredBuild: string | null;
}

// --- Launch arguments (PalServer.exe) ---
export interface LaunchArgsConfig {
  publicLobby: boolean;
  performanceFlags: boolean;
  customArgs: string;
}

// --- Historique des joueurs ---
export interface PlayerSession {
  joinAt: number;
  leaveAt: number | null;
}

export interface PlayerHistoryEntry {
  userId: string;
  playerId: string;
  name: string;
  firstSeen: number;
  lastSeen: number;
  lastIp: string;
  totalPlaytimeMs: number;
  sessionCount: number;
  online: boolean;
  currentSessionStart: number | null;
  sessions: PlayerSession[];
}
