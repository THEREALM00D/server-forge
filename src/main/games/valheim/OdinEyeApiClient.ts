import http from "http";
import { URL } from "url";
import type { OdinEyePlayer } from "../../../shared/types";

// Client pour le plugin BepInEx tiers Odin-Eye (https://sparcopt.github.io/odin-eye/),
// qui expose les données du serveur Valheim via une API REST JSON. Pas d'auth à
// ce jour côté plugin — `baseUrl` doit pointer sur 127.0.0.1 (jamais exposé
// publiquement), même logique que l'avertissement Palworld.
export class OdinEyeApiClient {
  constructor(private baseUrl: string) {}

  private request<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      let url: URL;
      try {
        url = new URL(path, this.baseUrl);
      } catch (e) {
        reject(e as Error);
        return;
      }
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port || 80,
          path: `${url.pathname}${url.search}`,
          method: "GET",
          timeout: 8000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              try {
                resolve(data ? (JSON.parse(data) as T) : (undefined as T));
              } catch {
                reject(new Error("Réponse Odin-Eye invalide"));
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          });
        },
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Timeout"));
      });
      req.end();
    });
  }

  // Le plugin v1.0.0.0 expose `/players` (tableau JSON) alors que la doc en
  // ligne décrit `/v1/players` (`{ entries: [...] }`). Tout chemin inconnu
  // répond un 200 au corps vide : on essaie les deux et on échoue plutôt que de
  // traiter un corps vide comme « aucun joueur » (le tracker fermerait alors
  // toutes les sessions ouvertes à tort).
  private async fetchPlayerList(): Promise<Partial<OdinEyePlayer>[]> {
    for (const path of ["/players", "/v1/players"]) {
      const res = await this.request<
        | Partial<OdinEyePlayer>[]
        | { entries: Partial<OdinEyePlayer>[] }
        | undefined
      >(path);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.entries)) return res.entries;
    }
    throw new Error("Odin-Eye : endpoint joueurs introuvable");
  }

  // Adapte les champs Odin-Eye au format attendu par PlayerHistoryTracker
  // (userId, playerId) — pas d'IP disponible côté API. Le plugin renvoie du
  // PascalCase (`SteamId: "Steam_7656119…"`), la doc du camelCase : on lit les
  // deux et on retire le préfixe `Steam_` pour retrouver le SteamID64 nu
  // (même format que adminlist.txt).
  async getPlayers(): Promise<{
    players: { userId: string; playerId: string; name: string }[];
  }> {
    const list = await this.fetchPlayerList();
    const players = list.flatMap((raw) => {
      const p = raw as Record<string, unknown>;
      const pick = (key: string): string => {
        const v = p[key] ?? p[key.charAt(0).toLowerCase() + key.slice(1)];
        return v === undefined || v === null ? "" : String(v);
      };
      const name = pick("Name");
      const userId = (pick("SteamId") || pick("Id") || name).replace(
        /^Steam_/,
        "",
      );
      if (!userId) return [];
      return [{ userId, playerId: pick("Id") || userId, name: name || userId }];
    });
    return { players };
  }
}
