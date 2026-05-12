import { join, basename } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  createWriteStream,
  rmSync,
  renameSync,
  openSync,
  readSync,
  closeSync,
} from "fs";
import archiver from "archiver";
import extractZip from "extract-zip";
import type { BackupEntry } from "../../shared/types";

// Signature de l'EOCD (End of Central Directory) : "PK\x05\x06"
const EOCD_SIGNATURE = Buffer.from([0x50, 0x4b, 0x05, 0x06]);

function isValidZip(filePath: string): boolean {
  try {
    const stats = statSync(filePath);
    if (stats.size < 22) return false; // EOCD minimum = 22 bytes
    // L'EOCD peut être suivi d'un commentaire jusqu'à 65535 bytes
    const tailSize = Math.min(stats.size, 65557);
    const buf = Buffer.alloc(tailSize);
    const fd = openSync(filePath, "r");
    try {
      readSync(fd, buf, 0, tailSize, stats.size - tailSize);
    } finally {
      closeSync(fd);
    }
    return buf.indexOf(EOCD_SIGNATURE) !== -1;
  } catch {
    return false;
  }
}

export class BackupManager {
  private schedulerTimer: NodeJS.Timeout | null = null;

  private getSavePath(serverPath: string): string {
    return join(serverPath, "Pal", "Saved", "SaveGames");
  }

  startScheduler(intervalMinutes: number, run: () => Promise<void>): void {
    this.stopScheduler();
    if (intervalMinutes <= 0) return;
    this.schedulerTimer = setInterval(
      () => {
        run().catch(() => {});
      },
      intervalMinutes * 60 * 1000,
    );
  }

  stopScheduler(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  ensureBackupDir(backupDir: string): void {
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  }

  list(backupDir: string): BackupEntry[] {
    if (!existsSync(backupDir)) return [];
    return readdirSync(backupDir)
      .filter((f) => f.endsWith(".zip") && !f.endsWith(".tmp.zip"))
      .map((f) => {
        const full = join(backupDir, f);
        const s = statSync(full);
        return {
          name: f,
          path: full,
          size: s.size,
          createdAt: s.mtimeMs,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  create(serverPath: string, backupDir: string): Promise<BackupEntry> {
    return new Promise((resolve, reject) => {
      const sourceDir = this.getSavePath(serverPath);
      if (!existsSync(sourceDir)) {
        reject(new Error(`Dossier de sauvegarde introuvable : ${sourceDir}`));
        return;
      }

      this.ensureBackupDir(backupDir);

      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
      const filename = `backup-${ts}.zip`;
      const outputPath = join(backupDir, filename);
      // Écrit dans un .tmp.zip puis rename à la fin pour rendre la création atomique :
      // un crash pendant le zip laisse un .tmp.zip (ignoré par list()) mais jamais
      // un .zip corrompu visible dans la liste.
      const tempPath = join(backupDir, `${filename}.tmp.zip`);

      const cleanup = () => {
        try {
          if (existsSync(tempPath)) unlinkSync(tempPath);
        } catch {
          // ignore
        }
      };

      const output = createWriteStream(tempPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        try {
          renameSync(tempPath, outputPath);
        } catch (err) {
          cleanup();
          reject(err as Error);
          return;
        }
        const s = statSync(outputPath);
        resolve({
          name: filename,
          path: outputPath,
          size: s.size,
          createdAt: s.mtimeMs,
        });
      });

      output.on("error", (err) => {
        cleanup();
        reject(err);
      });
      archive.on("error", (err) => {
        cleanup();
        reject(err);
      });
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async restore(serverPath: string, backupPath: string): Promise<void> {
    if (!existsSync(backupPath)) {
      throw new Error(`Fichier de backup introuvable : ${backupPath}`);
    }
    if (!isValidZip(backupPath)) {
      throw new Error(
        `Fichier ZIP corrompu ou incomplet : ${basename(backupPath)}. ` +
          `Le backup a probablement été interrompu pendant sa création. ` +
          `Essayez de l'ouvrir avec 7-Zip pour tenter une récupération manuelle.`,
      );
    }

    const targetDir = this.getSavePath(serverPath);
    // Restore atomique : extraire dans un dossier .restore.tmp à côté du target.
    // Si extraction OK, on swap. Si elle plante, le save courant est intact.
    const stagingDir = `${targetDir}.restore.tmp`;
    const backupOfCurrent = `${targetDir}.previous`;

    // Nettoie un staging orphelin (extraction précédente interrompue)
    if (existsSync(stagingDir)) {
      rmSync(stagingDir, { recursive: true, force: true });
    }
    mkdirSync(stagingDir, { recursive: true });

    try {
      await extractZip(backupPath, { dir: stagingDir });
    } catch (err) {
      // Extraction ratée : on nettoie le staging et on laisse le save courant intact
      rmSync(stagingDir, { recursive: true, force: true });
      throw err;
    }

    // Extraction réussie : on déplace l'ancien save sur le côté, on met le staging
    // à la place, puis on supprime l'ancien. En cas de crash entre les deux renames,
    // le .previous reste récupérable manuellement.
    if (existsSync(backupOfCurrent)) {
      rmSync(backupOfCurrent, { recursive: true, force: true });
    }
    if (existsSync(targetDir)) {
      renameSync(targetDir, backupOfCurrent);
    }
    try {
      renameSync(stagingDir, targetDir);
    } catch (err) {
      // Rollback : on tente de remettre l'ancien save en place
      if (existsSync(backupOfCurrent) && !existsSync(targetDir)) {
        try {
          renameSync(backupOfCurrent, targetDir);
        } catch {
          // ignore — le user a son ancien save dans .previous
        }
      }
      throw err;
    }
    // Tout est bon : supprime la sauvegarde de sécurité
    if (existsSync(backupOfCurrent)) {
      rmSync(backupOfCurrent, { recursive: true, force: true });
    }
  }

  delete(backupPath: string): void {
    if (existsSync(backupPath)) unlinkSync(backupPath);
  }

  rotate(backupDir: string, keep: number): void {
    if (keep <= 0) return;
    const list = this.list(backupDir);
    list.slice(keep).forEach((b) => this.delete(b.path));
  }

  getDefaultBackupDir(userDataPath: string): string {
    return join(userDataPath, "backups");
  }

  basename(p: string): string {
    return basename(p);
  }
}
