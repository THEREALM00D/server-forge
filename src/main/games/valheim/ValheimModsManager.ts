import { join } from "path";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  renameSync,
  createWriteStream,
  unlinkSync,
} from "fs";
import https from "https";
import http from "http";
import extractZip from "extract-zip";
import type {
  ValheimMod,
  ThunderstoreModInfo,
  ThunderstoreModVersion,
} from "../../../shared/types";

interface TSVersion {
  version_number: string;
  download_url: string;
}

export class ValheimModsManager {
  constructor(
    private serverPath: string,
    private dataDir: string,
  ) {}

  private get pluginsPath(): string {
    return join(this.serverPath, "BepInEx", "plugins");
  }

  private get metaPath(): string {
    return join(this.dataDir, "mods.json");
  }

  detectBepInEx(): boolean {
    return existsSync(join(this.serverPath, "BepInEx", "core", "BepInEx.dll"));
  }

  // Lit uniquement le JSON — sans scanner le filesystem.
  // Déduplique par installDir en gardant l'entrée non-manuelle si les deux existent
  // (artefact d'un ancien bug où l'install créait un doublon "manuel").
  private readJson(): ValheimMod[] {
    if (!existsSync(this.metaPath)) return [];
    let mods: ValheimMod[];
    try {
      mods = JSON.parse(readFileSync(this.metaPath, "utf-8")) as ValheimMod[];
    } catch {
      return [];
    }
    const seen = new Map<string, ValheimMod>();
    for (const m of mods) {
      const existing = seen.get(m.installDir);
      // Préférer l'entrée thunderstore à l'entrée manual
      if (!existing || existing.source === "manual") seen.set(m.installDir, m);
    }
    const deduped = Array.from(seen.values());
    // Nettoyer le fichier si des doublons ont été trouvés
    if (deduped.length !== mods.length) this.save(deduped);
    return deduped;
  }

  list(): ValheimMod[] {
    const known = this.readJson();

    // Scanner BepInEx/plugins/ pour détecter les mods installés manuellement
    const manual: ValheimMod[] = [];
    if (existsSync(this.pluginsPath)) {
      const knownDirs = new Set([
        ...known.map((m) => m.installDir),
        ...known.map((m) => `${m.installDir}.disabled`),
      ]);
      for (const entry of readdirSync(this.pluginsPath, {
        withFileTypes: true,
      })) {
        if (!entry.isDirectory()) continue;
        const dirName = entry.name;
        const baseName = dirName.endsWith(".disabled")
          ? dirName.slice(0, -9)
          : dirName;
        if (knownDirs.has(dirName) || knownDirs.has(baseName)) continue;
        manual.push({
          modId: this.hashDir(baseName),
          fileId: 0,
          name: baseName,
          version: "?",
          author: "",
          summary: "",
          installedAt: 0,
          enabled: !dirName.endsWith(".disabled"),
          installDir: baseName,
          source: "manual",
        });
      }
    }

    return [...known, ...manual];
  }

  // Cherche le dossier qui contient directement BepInEx/core/BepInEx.dll.
  // Vérifie la racine puis un niveau de sous-dossiers (pattern Thunderstore).
  private findBepInExRoot(base: string): string | null {
    if (existsSync(join(base, "BepInEx", "core", "BepInEx.dll"))) return base;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sub = join(base, entry.name);
      if (existsSync(join(sub, "BepInEx", "core", "BepInEx.dll"))) return sub;
    }
    return null;
  }

  private hashDir(s: string): number {
    let h = 5381;
    for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return Math.abs(h) || 1;
  }

  private save(mods: ValheimMod[]): void {
    mkdirSync(this.dataDir, { recursive: true });
    writeFileSync(this.metaPath, JSON.stringify(mods, null, 2), "utf-8");
  }

  async install(
    mod: ThunderstoreModInfo,
    file: ThunderstoreModVersion,
    downloadUrl: string,
    onProgress: (msg: string) => void,
  ): Promise<ValheimMod> {
    mkdirSync(this.pluginsPath, { recursive: true });

    const safeName = mod.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const tempZip = join(this.dataDir, `${safeName}_${file.file_id}.zip`);

    onProgress(`Téléchargement de ${mod.name} v${file.version}…`);
    await this.downloadFile(downloadUrl, tempZip, onProgress);

    const installDir = `${safeName}_${mod.mod_id}`;
    const targetPath = join(this.pluginsPath, installDir);

    onProgress(`Extraction vers BepInEx/plugins/${installDir}…`);
    if (existsSync(targetPath))
      rmSync(targetPath, { recursive: true, force: true });
    mkdirSync(targetPath, { recursive: true });

    try {
      await extractZip(tempZip, { dir: targetPath });
    } finally {
      try {
        unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }

    const entry: ValheimMod = {
      modId: mod.mod_id,
      fileId: file.file_id,
      name: mod.name,
      version: file.version,
      author: mod.author,
      summary: mod.summary,
      installedAt: Date.now(),
      enabled: true,
      installDir,
      pictureUrl: mod.picture_url,
    };

    const mods = this.readJson().filter((m) => m.modId !== mod.mod_id);
    mods.push(entry);
    this.save(mods);

    onProgress(`${mod.name} installé avec succès.`);
    return entry;
  }

  // Fetch JSON avec suivi des redirections (30x) et User-Agent
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
            // Suivre les redirections 301/302/303/307/308
            if (
              res.statusCode &&
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              res.resume();
              ValheimModsManager.fetchJson<T>(res.headers.location, depth + 1)
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

  async installBepInEx(onProgress: (msg: string) => void): Promise<void> {
    onProgress("Récupération de BepInExPack_Valheim depuis Thunderstore…");
    interface TSPkg {
      versions?: TSVersion[];
      latest?: TSVersion;
    }
    const pkg = await ValheimModsManager.fetchJson<TSPkg>(
      "https://thunderstore.io/api/experimental/package/denikson/BepInExPack_Valheim/",
    );
    // L'API peut retourner soit versions[], soit un objet latest
    const latest = pkg.versions?.[0] ?? pkg.latest;
    if (!latest?.version_number || !latest?.download_url)
      throw new Error(
        "Impossible d'obtenir la version de BepInExPack_Valheim depuis Thunderstore",
      );

    onProgress(
      `Téléchargement de BepInExPack_Valheim v${latest.version_number}…`,
    );
    mkdirSync(this.dataDir, { recursive: true });
    const tempZip = join(this.dataDir, "bepinex_install.zip");
    await this.downloadFile(latest.download_url, tempZip, onProgress);

    onProgress("Extraction de BepInEx…");
    mkdirSync(this.serverPath, { recursive: true });

    // Les ZIPs Thunderstore ont souvent un dossier racine unique (ex: BepInExPack_Valheim/)
    // On extrait d'abord dans un dossier temporaire pour aplatir si nécessaire.
    const tempExtract = join(this.dataDir, "_bepinex_extract_" + Date.now());
    try {
      mkdirSync(tempExtract, { recursive: true });
      await extractZip(tempZip, { dir: tempExtract });

      // Trouver le dossier qui contient réellement BepInEx/core/BepInEx.dll.
      // Les ZIPs Thunderstore peuvent avoir manifest.json + icon.png à la racine
      // ET les fichiers du mod dans un sous-dossier (ex: BepInExPack_Valheim/).
      const srcDir = this.findBepInExRoot(tempExtract);
      if (!srcDir)
        throw new Error(
          "Structure BepInEx non reconnue dans le ZIP Thunderstore — BepInEx/core/BepInEx.dll introuvable",
        );

      for (const item of readdirSync(srcDir)) {
        const src = join(srcDir, item);
        const dest = join(this.serverPath, item);
        if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
        // cpSync fonctionne inter-lecteurs (C: → E:), renameSync non
        cpSync(src, dest, { recursive: true });
      }
    } finally {
      try {
        rmSync(tempExtract, { recursive: true, force: true });
        unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }
    onProgress(
      `BepInExPack_Valheim v${latest.version_number} installé avec succès.`,
    );
  }

  async installFromThunderstore(
    packageCode: string,
    onProgress: (msg: string) => void,
  ): Promise<ValheimMod> {
    const parts = packageCode.trim().split("-");
    if (parts.length < 3)
      throw new Error(
        "Format invalide. Attendu : Auteur-NomDuMod-Version (ex: denikson-BepInExPack_Valheim-5.4.2202)",
      );
    const version = parts[parts.length - 1];
    const name = parts[parts.length - 2];
    const namespace = parts.slice(0, parts.length - 2).join("-");

    mkdirSync(this.pluginsPath, { recursive: true });

    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const installDir = `${namespace}_${safeName}`;
    const tempZip = join(this.dataDir, `${safeName}_thunderstore.zip`);
    const downloadUrl = `https://thunderstore.io/package/download/${namespace}/${name}/${version}/`;

    onProgress(`Téléchargement de ${namespace}-${name} v${version}…`);
    await this.downloadFile(downloadUrl, tempZip, onProgress);

    const targetPath = join(this.pluginsPath, installDir);
    if (existsSync(targetPath))
      rmSync(targetPath, { recursive: true, force: true });
    mkdirSync(targetPath, { recursive: true });

    onProgress("Extraction…");
    try {
      await extractZip(tempZip, { dir: targetPath });
    } finally {
      try {
        unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }

    const entry: ValheimMod = {
      modId: Date.now(),
      fileId: 0,
      name: `${namespace}-${name}`,
      version,
      author: namespace,
      summary: "",
      installedAt: Date.now(),
      enabled: true,
      installDir,
      source: "thunderstore",
      thunderstoreCode: packageCode,
    };

    // Dédupliquer par code exact ET par installDir (mise à jour de version)
    const mods = this.readJson().filter(
      (m) => m.thunderstoreCode !== packageCode && m.installDir !== installDir,
    );
    mods.push(entry);
    this.save(mods);

    onProgress(`${entry.name} v${version} installé depuis Thunderstore.`);
    return entry;
  }

  // Décode un code de profil Thunderstore/r2modman et retourne la liste des
  // codes de packages au format "Auteur-Nom-Major.Minor.Patch".
  // Supporte :
  //  - UUID Thunderstore (ex: 019e762e-3e8d-2527-6323-118093c16a2a) → API fetch
  //  - base64 YAML r2modman (versionNumber.major/minor/patch)
  //  - base64 YAML simplifié (version: "X.Y.Z")
  //  - base64 JSON {mods:[{modRef}]}
  //  - liste brute de codes (un par ligne)
  async parseThunderstoreProfile(input: string): Promise<string[]> {
    const code = input.trim();

    // UUID Thunderstore (profil partagé via le site) → résoudre via l'API
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        code,
      )
    ) {
      const resp = await ValheimModsManager.fetchJson<
        string | { data?: string }
      >(`https://thunderstore.io/api/experimental/legacyprofile/${code}/`);
      // La réponse peut être : { data: "base64..." } ou une string base64 directe
      const profileData =
        typeof resp === "string"
          ? resp
          : ((resp as { data?: string }).data ?? JSON.stringify(resp));
      return this.parseThunderstoreProfile(profileData);
    }

    let decoded: string;
    try {
      let buf = Buffer.from(code, "base64");
      // Décompresser si le contenu est du gzip (signature 0x1f 0x8b)
      if (buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
        const { gunzipSync } = require("zlib") as typeof import("zlib");
        try {
          buf = gunzipSync(buf);
        } catch {
          // Pas du gzip valide, continuer avec le buffer original
        }
      }
      decoded = buf.toString("utf-8");
    } catch {
      throw new Error("Code de profil invalide (base64 incorrect)");
    }

    // Format 1: JSON { mods: [{ modRef: "Author-Name-Version", ... }] }
    try {
      const json = JSON.parse(decoded) as Record<string, unknown>;
      if (Array.isArray(json?.mods)) {
        const codes: string[] = [];
        for (const mod of json.mods as Record<string, unknown>[]) {
          const ref =
            (mod.modRef as string | undefined) ??
            (mod.dependency_string as string | undefined);
          if (ref && /^[^-]+-[^-]+-\d/.test(ref)) codes.push(ref);
        }
        if (codes.length > 0) return codes;
      }
    } catch {
      // pas du JSON
    }

    // Format 2: YAML r2modman avec versionNumber.major/minor/patch
    if (decoded.includes("versionNumber")) {
      const pattern =
        /name:\s*["']?([^"'\n\r]+?)["']?\r?\n[\s\S]*?major:\s*(\d+)\r?\n\s*minor:\s*(\d+)\r?\n\s*patch:\s*(\d+)/g;
      const codes: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(decoded)) !== null) {
        codes.push(`${m[1].trim()}-${m[2]}.${m[3]}.${m[4]}`);
      }
      if (codes.length > 0) return codes;
    }

    // Format 3: YAML simplifié avec version: "X.Y.Z"
    if (decoded.includes("version:")) {
      const pattern =
        /name:\s*["']?([^"'\n\r]+?)["']?[^\n]*\n[^\n]*version:\s*["']?(\d+\.\d+\.\d+)/g;
      const codes: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(decoded)) !== null) {
        codes.push(`${m[1].trim()}-${m[2]}`);
      }
      if (codes.length > 0) return codes;
    }

    // Format 4: liste brute de codes (un par ligne, format Auteur-Nom-X.Y.Z)
    const lines = decoded
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !l.startsWith("#") &&
          /^[A-Za-z0-9_]+-[A-Za-z0-9_]+-\d+\.\d+/.test(l),
      );
    if (lines.length > 0) return lines;

    throw new Error(
      `Format de profil Thunderstore non reconnu.\nContenu décodé (${decoded.length} car.) : ${decoded.slice(0, 300)}`,
    );
  }

  remove(modId: number): void {
    const jsonMods = this.readJson();
    // Chercher dans le JSON d'abord, fallback filesystem pour les mods manuels
    const mod =
      jsonMods.find((m) => m.modId === modId) ??
      this.list().find((m) => m.modId === modId);
    if (!mod) return;

    for (const suffix of ["", ".disabled"]) {
      const p = join(this.pluginsPath, `${mod.installDir}${suffix}`);
      if (existsSync(p)) rmSync(p, { recursive: true, force: true });
    }

    // Mettre à jour le JSON (les mods manuels n'y sont pas, save() est no-op)
    this.save(jsonMods.filter((m) => m.modId !== modId));
  }

  toggle(modId: number, enabled: boolean): void {
    const jsonMods = this.readJson();
    const jsonMod = jsonMods.find((m) => m.modId === modId);
    const mod = jsonMod ?? this.list().find((m) => m.modId === modId);
    if (!mod) return;

    const activePath = join(this.pluginsPath, mod.installDir);
    const disabledPath = join(this.pluginsPath, `${mod.installDir}.disabled`);

    if (enabled && existsSync(disabledPath)) {
      renameSync(disabledPath, activePath);
    } else if (!enabled && existsSync(activePath)) {
      renameSync(activePath, disabledPath);
    }

    // Persister uniquement pour les mods enregistrés dans le JSON
    if (jsonMod) {
      jsonMod.enabled = enabled;
      this.save(jsonMods);
    }
  }

  private downloadFile(
    url: string,
    dest: string,
    onProgress: (msg: string) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      mkdirSync(this.dataDir, { recursive: true });

      const protocol = url.startsWith("https") ? https : http;
      const file = createWriteStream(dest);

      const request = protocol.get(url, (res) => {
        // Suivre les redirections (302/301)
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          file.close();
          try {
            unlinkSync(dest);
          } catch {
            /* ignore */
          }
          this.downloadFile(res.headers.location, dest, onProgress)
            .then(resolve)
            .catch(reject);
          return;
        }

        const total = parseInt(res.headers["content-length"] ?? "0", 10);
        let received = 0;
        let lastPct = -1;

        res.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (total > 0) {
            const pct = Math.floor((received / total) * 100);
            if (pct !== lastPct && pct % 10 === 0) {
              lastPct = pct;
              onProgress(`Téléchargement… ${pct}%`);
            }
          }
        });

        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", (err) => {
          try {
            unlinkSync(dest);
          } catch {
            /* ignore */
          }
          reject(err);
        });
      });

      request.on("error", (err) => {
        try {
          unlinkSync(dest);
        } catch {
          /* ignore */
        }
        reject(err);
      });

      request.setTimeout(60000, () => {
        request.destroy();
        reject(new Error("Timeout du téléchargement"));
      });
    });
  }
}
