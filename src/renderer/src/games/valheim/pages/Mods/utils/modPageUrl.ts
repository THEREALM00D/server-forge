import type { ModRegistry } from "@shared/types";

// Miroir de main/games/valheim/registries.ts#modPageUrl — le renderer ne peut
// pas importer depuis src/main/, donc on duplique ce petit helper plutôt que
// de le partager (aucune logique métier, juste un pattern d'URL par registre).
export const REGISTRY_LABEL: Record<ModRegistry, string> = {
  thunderstore: "Thunderstore",
  hexium: "Hexium",
};

export function modPageUrl(
  registry: ModRegistry,
  owner: string,
  name: string,
): string {
  return registry === "hexium"
    ? `https://valheim.hexium.gg/mods/${owner}/${name}`
    : `https://thunderstore.io/c/valheim/p/${owner}/${name}/`;
}
