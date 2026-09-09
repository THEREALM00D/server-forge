import type { GameType } from "@shared/types";
import { palworldPlugin } from "./palworld";
import { valheimPlugin } from "./valheim";
import { astroneerPlugin } from "./astroneer";

export const GAMES = [palworldPlugin, valheimPlugin, astroneerPlugin];

// Utilisé comme repli quand aucun serveur actif n'est sélectionné — le shell
// (App.tsx, Sidebar.tsx) ne doit contenir aucun nom de jeu en dur.
export const DEFAULT_GAME: GameType = GAMES[0].id;

export const getGamePlugin = (gameType: GameType) =>
  GAMES.find((g) => g.id === gameType);
