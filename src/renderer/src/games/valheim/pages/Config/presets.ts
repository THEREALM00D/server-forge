// Noms de preset valides pour -preset (manuel officiel Iron Gate). Un preset
// écrase TOUS les modificateurs déjà persistés sur un monde existant — c'est
// le seul moyen documenté de forcer un reset, contrairement à un -modifier
// individuel vide/omis qui ne change rien à ce que le monde utilise déjà.
export const MODIFIER_PRESET_NAMES = [
  "Normal",
  "Casual",
  "Easy",
  "Hard",
  "Hardcore",
  "Immersive",
  "Hammer",
] as const;
