// Re-export shared types so existing imports keep working.
export type {
  SystemStats,
  ServerStatus,
  FirewallRuleStatus,
  PalServerInfo,
  PalPlayer,
  PalMetrics,
  BackupEntry,
  BackupConfig,
  RestartConfig,
  UpdateCheckResult,
  Server,
  GameType,
  ServerConfig,
} from "@shared/types";

// Specific to renderer
export interface OperationResult {
  success: boolean;
  error?: string;
}

export type GameId = "palworld";

export interface GameDefinition {
  id: GameId;
  name: string;
  steamAppId: number;
  executableName: string;
  configRelPath: string;
}
