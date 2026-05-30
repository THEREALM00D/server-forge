import { ipcMain } from "electron/main";
import { join } from "path";
import { homedir } from "os";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { shell } from "electron";
import type { IpcContext } from "../../../ipc/context";
import type { ValheimLaunchConfig } from "../../../../shared/types";

// Retourne le dossier de base des données Valheim (custom savedir ou LocalAppData\Low\IronGate\Valheim).
function getValheimDataDir(savedir: string): string {
  return (
    savedir || join(homedir(), "AppData", "LocalLow", "IronGate", "Valheim")
  );
}

function readList(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function writeList(filePath: string, list: string[]): void {
  const dir = join(filePath, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, list.join("\r\n"), "utf-8");
}

export function registerValheimHandlers(ctx: IpcContext): void {
  ipcMain.handle("valheim:getConfig", (_, serverId?: string) =>
    ctx.getValheimConfig(serverId),
  );

  ipcMain.handle(
    "valheim:setConfig",
    (_, cfg: Partial<ValheimLaunchConfig>, serverId?: string) => {
      ctx.updateValheimConfig(serverId, cfg);
    },
  );

  // Ouvre le dossier de sauvegardes Valheim : chemin custom si défini, sinon
  // le dossier par défaut (%LOCALAPPDATA_LOW%\IronGate\Valheim\worlds).
  ipcMain.handle("valheim:openSaveFolder", (_, customSavedir: string) => {
    const target = join(getValheimDataDir(customSavedir), "worlds_local");
    if (!existsSync(target)) mkdirSync(target, { recursive: true });
    return shell.openPath(target);
  });

  // --- Listes de contrôle d'accès ---

  ipcMain.handle("valheim:getAdminList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "adminlist.txt"));
  });

  ipcMain.handle(
    "valheim:setAdminList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(join(getValheimDataDir(cfg.savedir), "adminlist.txt"), list);
    },
  );

  ipcMain.handle("valheim:getBannedList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "bannedlist.txt"));
  });

  ipcMain.handle(
    "valheim:setBannedList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(join(getValheimDataDir(cfg.savedir), "bannedlist.txt"), list);
    },
  );

  ipcMain.handle("valheim:getPermittedList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "permittedlist.txt"));
  });

  ipcMain.handle(
    "valheim:setPermittedList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(
        join(getValheimDataDir(cfg.savedir), "permittedlist.txt"),
        list,
      );
    },
  );
}
