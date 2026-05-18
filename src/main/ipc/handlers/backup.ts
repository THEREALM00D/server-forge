import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";

interface BackupCfgInput {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

export function registerBackupHandlers(ctx: IpcContext): void {
  ipcMain.handle("backup:getConfig", () => ({
    backupDir: ctx.getBackupDir(),
    backupKeep: ctx.store.get("backupKeep", 10),
    backupIntervalMinutes: ctx.store.get("backupIntervalMinutes", 0),
  }));

  ipcMain.handle("backup:setConfig", (_, cfg: BackupCfgInput) => {
    ctx.store.set("backupDir", cfg.backupDir);
    ctx.store.set("backupKeep", cfg.backupKeep);
    ctx.store.set("backupIntervalMinutes", cfg.backupIntervalMinutes);
    ctx.applyBackupScheduler();
  });

  ipcMain.handle("backup:list", () => ctx.backup.list(ctx.getBackupDir()));

  ipcMain.handle("backup:create", async () => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    const dir = ctx.getBackupDir();
    const entry = await ctx.backup.create(serverPath, dir);
    ctx.backup.rotate(dir, ctx.store.get("backupKeep", 10));
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
