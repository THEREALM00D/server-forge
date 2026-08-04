import type { GameType, ServerConfig } from "../../shared/types";
import { palworldServerConfig } from "./palworld/serverConfig";
import { valheimServerConfig } from "./valheim/serverConfig";
import { astroneerServerConfig } from "./astroneer/serverConfig";
import type { PalConfigParser } from "./palworld/PalConfigParser";

const GAME_SERVER_CONFIGS = {
  palworld: palworldServerConfig,
  valheim: valheimServerConfig,
  astroneer: astroneerServerConfig,
};

export const getGameServerConfig = (type: GameType) =>
  GAME_SERVER_CONFIGS[type];

export function buildGameArgs(gameType: GameType, cfg: ServerConfig): string[] {
  if (gameType === "valheim")
    return valheimServerConfig.buildArgs(cfg.valheimConfig);
  if (gameType === "astroneer")
    return astroneerServerConfig.buildArgs(cfg.astroneerConfig);
  return palworldServerConfig.buildArgs(cfg.launchArgs);
}

export function getGameStopConfig(
  gameType: GameType,
  serverPath: string,
  configParser: PalConfigParser,
) {
  if (gameType === "valheim") return valheimServerConfig.getStopConfig();
  if (gameType === "astroneer") return astroneerServerConfig.getStopConfig();
  return palworldServerConfig.getStopConfig(serverPath, configParser);
}
