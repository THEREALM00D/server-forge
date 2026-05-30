import https from "https";
import type { NexusModInfo, NexusModFile } from "../../../shared/types";

const BASE_URL = "api.nexusmods.com";
const GAME_DOMAIN = "valheim";
const APP_NAME = "ServerForge";
const APP_VERSION = "1.0.0";

export interface NexusUser {
  username: string;
  is_premium: boolean;
  email: string;
}

export class NexusModsClient {
  constructor(private apiKey: string) {}

  // Requête v3 publique sans authentification
  private static requestV3<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: BASE_URL,
        path: `/v3${path}`,
        method: "GET",
        headers: {
          "Application-Name": APP_NAME,
          "Application-Version": APP_VERSION,
          Accept: "application/json",
          "User-Agent": `${APP_NAME}/${APP_VERSION}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as T);
            } catch {
              reject(new Error("Réponse JSON invalide"));
            }
          } else {
            reject(
              new Error(`NexusMods API v3 erreur ${res.statusCode}: ${data}`),
            );
          }
        });
      });

      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error("Timeout NexusMods API"));
      });
      req.on("error", reject);
      req.end();
    });
  }

  private request<T>(path: string, query?: Record<string, string>): Promise<T> {
    return new Promise((resolve, reject) => {
      let url = `/v1${path}`;
      if (query) {
        const params = new URLSearchParams(query).toString();
        if (params) url += `?${params}`;
      }

      const options: https.RequestOptions = {
        hostname: BASE_URL,
        path: url,
        method: "GET",
        headers: {
          apikey: this.apiKey,
          "Application-Name": APP_NAME,
          "Application-Version": APP_VERSION,
          Accept: "application/json",
          "User-Agent": `${APP_NAME}/${APP_VERSION}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as T);
            } catch {
              reject(new Error("Réponse JSON invalide"));
            }
          } else if (res.statusCode === 401) {
            reject(new Error("Clé API NexusMods invalide ou expirée"));
          } else if (res.statusCode === 429) {
            reject(new Error("Limite de requêtes NexusMods atteinte"));
          } else {
            reject(
              new Error(`NexusMods API erreur ${res.statusCode}: ${data}`),
            );
          }
        });
      });

      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error("Timeout NexusMods API"));
      });

      req.on("error", reject);
      req.end();
    });
  }

  // Trending public (v3, pas de clé API requise) — top 5 seulement
  // mod_id est extrait depuis mod_page_url (ex: /valheim/mods/12345)
  static async getTrendingPublic(): Promise<NexusModInfo[]> {
    interface V3TrendingMod {
      name: string;
      author?: string | null;
      summary?: string | null;
      picture_url?: string | null;
      mod_page_url: string;
    }
    interface V3TrendingResponse {
      data: { mods: V3TrendingMod[] };
    }
    const res = await NexusModsClient.requestV3<V3TrendingResponse>(
      `/games/${GAME_DOMAIN}/trending-mods`,
    );
    return (res.data?.mods ?? []).map((m) => {
      const idMatch = m.mod_page_url.match(/\/mods\/(\d+)/);
      const mod_id = idMatch ? parseInt(idMatch[1], 10) : 0;
      return {
        mod_id,
        name: m.name,
        summary: m.summary ?? "",
        picture_url: m.picture_url ?? undefined,
        version: "",
        author: m.author ?? "",
        endorsement_count: 0,
        updated_timestamp: 0,
      };
    });
  }

  validateApiKey(): Promise<NexusUser> {
    return this.request<NexusUser>("/users/validate.json");
  }

  getTrending(): Promise<NexusModInfo[]> {
    return this.request<NexusModInfo[]>(
      `/games/${GAME_DOMAIN}/mods/trending.json`,
    );
  }

  getLatestAdded(): Promise<NexusModInfo[]> {
    return this.request<NexusModInfo[]>(
      `/games/${GAME_DOMAIN}/mods/latest_added.json`,
    );
  }

  getLatestUpdated(): Promise<NexusModInfo[]> {
    return this.request<NexusModInfo[]>(
      `/games/${GAME_DOMAIN}/mods/latest_updated.json`,
    );
  }

  getMod(modId: number): Promise<NexusModInfo> {
    return this.request<NexusModInfo>(
      `/games/${GAME_DOMAIN}/mods/${modId}.json`,
    );
  }

  async getModFiles(modId: number): Promise<NexusModFile[]> {
    const res = await this.request<{ files: NexusModFile[] }>(
      `/games/${GAME_DOMAIN}/mods/${modId}/files.json`,
    );
    return res.files ?? [];
  }

  async getDownloadUrl(
    modId: number,
    fileId: number,
    key: string,
    expires: string,
  ): Promise<string> {
    const links = await this.request<{ URI: string }[]>(
      `/games/${GAME_DOMAIN}/mods/${modId}/files/${fileId}/download_link.json`,
      { key, expires },
    );
    const first = links?.[0]?.URI;
    if (!first) throw new Error("Aucun lien de téléchargement disponible");
    return first;
  }
}

// Parse nxm://valheim/mods/{modId}/files/{fileId}?key=xxx&expires=xxx
export function parseNxmUrl(nxmUrl: string): {
  modId: number;
  fileId: number;
  key: string;
  expires: string;
} {
  try {
    // nxm:// n'est pas reconnu par URL() — on remplace par https://
    const normalized = nxmUrl.replace(/^nxm:\/\//i, "https://nxm/");
    const url = new URL(normalized);
    const parts = url.pathname.split("/").filter(Boolean);
    // pathname = /mods/{modId}/files/{fileId}
    const modId = parseInt(parts[1], 10);
    const fileId = parseInt(parts[3], 10);
    const key = url.searchParams.get("key") ?? "";
    const expires = url.searchParams.get("expires") ?? "";
    if (isNaN(modId) || isNaN(fileId)) throw new Error("URL nxm:// invalide");
    return { modId, fileId, key, expires };
  } catch {
    throw new Error(`Impossible de parser l'URL nxm : ${nxmUrl}`);
  }
}
