import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";

interface BackupCfgInput {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

export function registerBackupHandlers(ctx: IpcContext): void {
  ipcMain.handle("backup:getConfig", () => {
    const cfg = ctx.getServerConfig().backup;
    return {
      backupDir: ctx.getBackupDir(),
      backupKeep: cfg.backupKeep,
      backupIntervalMinutes: cfg.backupIntervalMinutes,
    };
  });

  ipcMain.handle("backup:setConfig", (_, cfg: BackupCfgInput) => {
    ctx.updateServerConfig(undefined, { backup: cfg });
    ctx.applyBackupScheduler();
  });

  ipcMain.handle("backup:list", () => ctx.backup.list(ctx.getBackupDir()));

  ipcMain.handle("backup:create", async () => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    const dir = ctx.getBackupDir();
    const entry = await ctx.backup.create(serverPath, dir);
    ctx.backup.rotate(dir, ctx.getServerConfig().backup.backupKeep);
    return entry;
  });

  ipcMain.handle("backup:restore", async (_, backupPath: string) => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    if (ctx.serverManager.getStatus() === "running") {
      throw new Error("Arrêtez le serveur avant de restaurer une sauvegarde");
    }
    await ctx.backup.restore(serverPath, backupPath);
  });

  ipcMain.handle("backup:delete", (_, backupPath: string) => {
    ctx.backup.delete(backupPath);
  });
}
