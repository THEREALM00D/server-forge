import { join } from "path";
import {
  existsSync,
  mkdirSync,
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
  NexusModInfo,
  NexusModFile,
} from "../../../shared/types";

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

  list(): ValheimMod[] {
    if (!existsSync(this.metaPath)) return [];
    try {
      return JSON.parse(readFileSync(this.metaPath, "utf-8")) as ValheimMod[];
    } catch {
      return [];
    }
  }

  private save(mods: ValheimMod[]): void {
    mkdirSync(this.dataDir, { recursive: true });
    writeFileSync(this.metaPath, JSON.stringify(mods, null, 2), "utf-8");
  }

  async install(
    mod: NexusModInfo,
    file: NexusModFile,
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

    const mods = this.list().filter((m) => m.modId !== mod.mod_id);
    mods.push(entry);
    this.save(mods);

    onProgress(`${mod.name} installé avec succès.`);
    return entry;
  }

  remove(modId: number): void {
    const mods = this.list();
    const mod = mods.find((m) => m.modId === modId);
    if (!mod) return;

    // Supprimer le dossier (actif ou désactivé)
    for (const suffix of ["", ".disabled"]) {
      const p = join(this.pluginsPath, `${mod.installDir}${suffix}`);
      if (existsSync(p)) rmSync(p, { recursive: true, force: true });
    }

    this.save(mods.filter((m) => m.modId !== modId));
  }

  toggle(modId: number, enabled: boolean): void {
    const mods = this.list();
    const mod = mods.find((m) => m.modId === modId);
    if (!mod) return;

    const activePath = join(this.pluginsPath, mod.installDir);
    const disabledPath = join(this.pluginsPath, `${mod.installDir}.disabled`);

    if (enabled && existsSync(disabledPath)) {
      renameSync(disabledPath, activePath);
    } else if (!enabled && existsSync(activePath)) {
      renameSync(activePath, disabledPath);
    }

    mod.enabled = enabled;
    this.save(mods);
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
