import type { GameType } from "@shared/types";
import { palworldPlugin } from "./palworld";
import { valheimPlugin } from "./valheim";
import { astroneerPlugin } from "./astroneer";

export const GAMES = [palworldPlugin, valheimPlugin, astroneerPlugin];

export const getGamePlugin = (gameType: GameType) =>
  GAMES.find((g) => g.id === gameType);
