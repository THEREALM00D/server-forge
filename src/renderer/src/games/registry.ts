import type { GameType } from "@shared/types";
import { palworldPlugin } from "./palworld";
import { valheimPlugin } from "./valheim";

export const GAMES = [palworldPlugin, valheimPlugin];

export const getGamePlugin = (gameType: GameType) =>
  GAMES.find((g) => g.id === gameType);
