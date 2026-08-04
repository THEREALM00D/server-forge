import { ipcMain } from "electron/main";
import { join } from "path";
import { homedir } from "os";
import type { IpcContext } from "../context";

interface BackupCfgInput {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

// Retourne le dossier des mondes Valheim : custom savedir ou %LOCALAPPDATA_LOW%/IronGate/Valheim/worlds_local
function getValheimWorldsPath(savedir: string): string {
  const base =
    savedir || join(homedir(), "AppData", "LocalLow", "IronGate", "Valheim");
  return join(base, "worlds_local");
}

// Dossier des sauvegardes Astroneer (à l'intérieur du dossier serveur, comme Palworld).
function getAstroneerSavePath(serverPath: string): string {
  return join(serverPath, "Astro", "Saved", "SaveGames");
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
    const server = ctx.getActiveServer();
    const sourcePath =
      server?.gameType === "valheim"
        ? getValheimWorldsPath(ctx.getValheimConfig().savedir)
        : server?.gameType === "astroneer"
          ? getAstroneerSavePath(serverPath)
          : undefined;
    const entry = await ctx.backup.create(serverPath, dir, sourcePath);
    ctx.backup.rotate(dir, ctx.getServerConfig().backup.backupKeep);
    return entry;
  });

  ipcMain.handle("backup:restore", async (_, backupPath: string) => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    if (ctx.serverManagers.getActive()?.getStatus() === "running") {
      throw new Error("Arrêtez le serveur avant de restaurer une sauvegarde");
    }
    const server = ctx.getActiveServer();
    const saveDir =
      server?.gameType === "valheim"
        ? getValheimWorldsPath(ctx.getValheimConfig().savedir)
        : server?.gameType === "astroneer"
          ? getAstroneerSavePath(serverPath)
          : undefined;
    await ctx.backup.restore(serverPath, backupPath, saveDir);
  });

  ipcMain.handle("backup:delete", (_, backupPath: string) => {
    ctx.backup.delete(backupPath);
  });
}
