import https from "https";
import http from "http";
import type {
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModUpdate,
} from "../../../shared/types";
// Importer les types générés depuis le spec OpenAPI Thunderstore
// Régénérer avec : yarn generate:thunderstore
import type {
  PackageVersionExperimental,
  PackageExperimental,
} from "./thunderstore-api";

// Le endpoint v1 /c/valheim/api/v1/package/ retourne les versions avec file_size,
// champ présent dans la réponse réelle mais absent du spec (erreur du spec).
type TSVersion = PackageVersionExperimental & { file_size?: number };

// Le Swagger spec décrit incorrectement le endpoint v1 community list :
// - rating_score est un nombre dans la réponse réelle (string dans PackageListing)
// - is_deprecated est un boolean réel (string dans PackageListing)
// - versions est TSVersion[] réel (string dans PackageListing)
// On redéfinit proprement en réutilisant PackageVersionExperimental.
interface TSPackageV1 extends Omit<
  PackageExperimental,
  "latest" | "community_listings" | "rating_score" | "is_deprecated"
> {
  name: string;
  full_name: string;
  owner: string;
  date_created: string;
  date_updated: string;
  rating_score: number;
  is_deprecated: boolean;
  versions: TSVersion[];
}

function hashString(s: string): number {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return Math.abs(h) || 1;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export class ThunderstoreClient {
  private static cache: { data: TSPackageV1[]; ts: number } | null = null;

  private static fetchJson<T>(url: string, depth = 0): Promise<T> {
    if (depth > 5) return Promise.reject(new Error("Trop de redirections"));
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const mod = parsed.protocol === "https:" ? https : http;
      mod
        .get(
          {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: {
              "User-Agent": "ServerForge/1.0.0",
              Accept: "application/json",
            },
          },
          (res) => {
            if (
              res.statusCode &&
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              res.resume();
              ThunderstoreClient.fetchJson<T>(res.headers.location, depth + 1)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (res.statusCode && res.statusCode >= 400) {
              res.resume();
              reject(new Error(`Thunderstore API erreur ${res.statusCode}`));
              return;
            }
            let data = "";
            res.on("data", (c: string) => (data += c));
            res.on("end", () => {
              try {
                resolve(JSON.parse(data) as T);
              } catch {
                reject(
                  new Error(
                    `Réponse JSON invalide (${res.statusCode}): ${data.slice(0, 120)}`,
                  ),
                );
              }
            });
          },
        )
        .on("error", reject);
    });
  }

  // Récupère tous les packages Valheim avec cache TTL 5 min
  static async listPackages(): Promise<TSPackageV1[]> {
    const now = Date.now();
    if (
      ThunderstoreClient.cache &&
      now - ThunderstoreClient.cache.ts < CACHE_TTL_MS
    ) {
      return ThunderstoreClient.cache.data;
    }
    const data = await ThunderstoreClient.fetchJson<TSPackageV1[]>(
      "https://thunderstore.io/c/valheim/api/v1/package/",
    );
    const filtered = data.filter(
      (p) => !p.is_deprecated && p.versions.length > 0,
    );
    ThunderstoreClient.cache = { data: filtered, ts: now };
    return filtered;
  }

  // Cherche un package dans le cache puis dans la liste complète
  static async getPackage(
    namespace: string,
    name: string,
  ): Promise<TSPackageV1> {
    const pkgs = await ThunderstoreClient.listPackages();
    const pkg = pkgs.find((p) => p.owner === namespace && p.name === name);
    if (!pkg)
      throw new Error(`Package Thunderstore ${namespace}-${name} introuvable`);
    return pkg;
  }

  static toModInfo(pkg: TSPackageV1): ThunderstoreModInfo {
    const v = pkg.versions[0];
    return {
      mod_id: hashString(pkg.full_name),
      name: pkg.name,
      summary: v.description,
      picture_url: v.icon ?? undefined,
      version: v.version_number,
      author: pkg.owner,
      endorsement_count: pkg.rating_score,
      updated_timestamp: Math.floor(
        new Date(pkg.date_updated).getTime() / 1000,
      ),
    };
  }

  static toModFiles(pkg: TSPackageV1): ThunderstoreModVersion[] {
    return pkg.versions
      .filter((v) => v.is_active !== false)
      .map((v) => ({
        file_id: hashString(v.version_number + (pkg.full_name ?? "")),
        file_name: v.version_number,
        version: v.version_number,
        size_kb: v.file_size ? Math.round(v.file_size / 1024) : 0,
        category_name: "MAIN",
        description: v.description,
        uploaded_timestamp: v.date_created
          ? Math.floor(new Date(v.date_created).getTime() / 1000)
          : 0,
      }));
  }

  static async getTrending(limit = 20): Promise<ThunderstoreModInfo[]> {
    const pkgs = await ThunderstoreClient.listPackages();
    return pkgs
      .sort((a, b) => b.rating_score - a.rating_score)
      .slice(0, limit)
      .map(ThunderstoreClient.toModInfo);
  }

  static async getLatestAdded(limit = 20): Promise<ThunderstoreModInfo[]> {
    const pkgs = await ThunderstoreClient.listPackages();
    return pkgs
      .sort(
        (a, b) =>
          new Date(b.date_created).getTime() -
          new Date(a.date_created).getTime(),
      )
      .slice(0, limit)
      .map(ThunderstoreClient.toModInfo);
  }

  static async getLatestUpdated(limit = 20): Promise<ThunderstoreModInfo[]> {
    const pkgs = await ThunderstoreClient.listPackages();
    return pkgs
      .sort(
        (a, b) =>
          new Date(b.date_updated).getTime() -
          new Date(a.date_updated).getTime(),
      )
      .slice(0, limit)
      .map(ThunderstoreClient.toModInfo);
  }

  static async search(
    query: string,
    limit = 50,
  ): Promise<ThunderstoreModInfo[]> {
    const q = query.toLowerCase();
    const pkgs = await ThunderstoreClient.listPackages();
    return pkgs
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.full_name ?? "").toLowerCase().includes(q) ||
          (p.owner ?? "").toLowerCase().includes(q) ||
          p.versions[0]?.description.toLowerCase().includes(q),
      )
      .slice(0, limit)
      .map(ThunderstoreClient.toModInfo);
  }

  // Retourne les dépendances non installées d'un package (exclut BepInExPack_Valheim)
  static async getMissingDeps(
    namespace: string,
    name: string,
    installedCodes: string[],
  ): Promise<ThunderstoreModInfo[]> {
    let pkg: TSPackageV1;
    try {
      pkg = await ThunderstoreClient.getPackage(namespace, name);
    } catch {
      return [];
    }

    const latestVersion = pkg.versions[0];
    if (!latestVersion) return [];

    // L'API retourne string[] malgré le spec qui dit string
    const deps = (latestVersion.dependencies as unknown as string[]) ?? [];
    if (!Array.isArray(deps) || deps.length === 0) return [];

    // "namespace-name" des mods déjà installés (sans version)
    const installedKeys = new Set(
      installedCodes.filter(Boolean).map((c) => {
        const parts = c.split("-");
        return parts.length >= 3
          ? parts.slice(0, parts.length - 1).join("-")
          : c;
      }),
    );

    const pkgs = await ThunderstoreClient.listPackages();
    const result: ThunderstoreModInfo[] = [];

    for (const dep of deps) {
      const parts = dep.split("-");
      if (parts.length < 3) continue;
      const depName = parts[parts.length - 2];
      const depNamespace = parts.slice(0, parts.length - 2).join("-");
      const depKey = `${depNamespace}-${depName}`;

      if (depName === "BepInExPack_Valheim") continue;
      if (installedKeys.has(depKey)) continue;

      const depPkg = pkgs.find(
        (p) => p.owner === depNamespace && p.name === depName,
      );
      if (depPkg) result.push(ThunderstoreClient.toModInfo(depPkg));
    }

    return result;
  }

  // Retourne les mods installés (via thunderstoreCode) qui ont une version plus récente
  static async checkUpdates(installedCodes: string[]): Promise<ModUpdate[]> {
    const pkgs = await ThunderstoreClient.listPackages();
    const updates: ModUpdate[] = [];

    for (const code of installedCodes) {
      if (!code) continue;
      const parts = code.split("-");
      if (parts.length < 3) continue;
      const installedVersion = parts[parts.length - 1];
      const modName = parts[parts.length - 2];
      const modNamespace = parts.slice(0, parts.length - 2).join("-");

      const pkg = pkgs.find(
        (p) => p.owner === modNamespace && p.name === modName,
      );
      if (!pkg?.versions[0]) continue;

      const latestVersion = pkg.versions[0].version_number;
      if (latestVersion && latestVersion !== installedVersion) {
        updates.push({
          installedCode: code,
          latestCode: `${modNamespace}-${modName}-${latestVersion}`,
          latestVersion,
          name: pkg.name,
          author: pkg.owner,
        });
      }
    }

    return updates;
  }
}
