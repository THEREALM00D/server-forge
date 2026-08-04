// Types partagés entre main, preload et renderer.
// Tout ce qui transite via IPC doit avoir le même type des deux côtés.

// --- Serveurs ---
export type GameType = "palworld" | "valheim" | "astroneer";

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
  valheimConfig: ValheimLaunchConfig;
  astroneerConfig: AstroneerLaunchConfig;
  backup: BackupConfig;
  restart: RestartConfig;
}

// Payload émis par le main vers le renderer pour chaque ligne de log
// produite par un serveur. Inclut le `serverId` pour permettre au renderer
// de filtrer/agréger les logs multi-serveurs (Phase 5).
export interface ServerLogEvent {
  serverId: string;
  line: string;
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

// --- Launch arguments (valheim_server.exe) ---
export interface ValheimModifiers {
  combat: "veryhard" | "hard" | "normal" | "easy" | "veryeasy" | "";
  deathpenalty: "casual" | "veryeasy" | "easy" | "normal" | "hard" | "";
  resources: "muchless" | "less" | "normal" | "more" | "mostmore" | "";
  raids: "none" | "muchless" | "less" | "normal" | "more" | "";
  portals: "casual" | "hard" | "veryhard" | "";
}

export interface ValheimLaunchConfig {
  name: string;
  world: string;
  password: string;
  port: number;
  public: boolean;
  savedir: string;
  crossplay: boolean;
  logFile: string;
  customArgs: string;
  worldSeed: string;
  worldSize: "small" | "medium" | "large" | "yolo" | "";
  modifiers: ValheimModifiers;
}

// --- Launch arguments (AstroServer.exe) ---
// Astroneer se configure quasi entièrement via Engine.ini / AstroServerSettings.ini
// (voir AstroneerSettings ci-dessous) — customArgs reste pour parité avec les autres jeux.
export interface AstroneerLaunchConfig {
  customArgs: string;
}

// --- Config INI Astroneer (Engine.ini + AstroServerSettings.ini fusionnés) ---
export type AstroneerSettings = Record<string, string | number | boolean>;

// --- Mods Valheim ---
export interface ValheimMod {
  modId: number;
  fileId: number;
  name: string;
  version: string;
  author: string;
  summary: string;
  installedAt: number;
  enabled: boolean;
  installDir: string; // nom du dossier dans BepInEx/plugins/
  pictureUrl?: string;
  source?: "thunderstore" | "manual";
  thunderstoreCode?: string; // "Auteur-Nom-Version" pour les mods Thunderstore
}

export interface ThunderstoreModInfo {
  mod_id: number;
  name: string;
  summary: string;
  picture_url?: string;
  version: string;
  author: string;
  endorsement_count: number;
  updated_timestamp: number;
}

export interface ThunderstoreModVersion {
  file_id: number;
  file_name: string;
  version: string;
  size_kb: number;
  category_name: string;
  description: string;
  uploaded_timestamp: number;
}

export interface ModUpdate {
  installedCode: string;
  latestCode: string;
  latestVersion: string;
  name: string;
  author: string;
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
