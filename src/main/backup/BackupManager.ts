import { join, basename } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  createWriteStream,
  rmSync,
} from "fs";
import archiver from "archiver";
import extractZip from "extract-zip";

export interface BackupEntry {
  name: string;
  path: string;
  size: number;
  createdAt: number;
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
      .filter((f) => f.endsWith(".zip"))
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

      const output = createWriteStream(outputPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        const s = statSync(outputPath);
        resolve({
          name: filename,
          path: outputPath,
          size: s.size,
          createdAt: s.mtimeMs,
        });
      });

      archive.on("error", (err) => reject(err));
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async restore(serverPath: string, backupPath: string): Promise<void> {
    if (!existsSync(backupPath)) {
      throw new Error(`Fichier de backup introuvable : ${backupPath}`);
    }
    const targetDir = this.getSavePath(serverPath);
    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true, force: true });
    }
    mkdirSync(targetDir, { recursive: true });
    await extractZip(backupPath, { dir: targetDir });
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
