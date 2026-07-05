import { ipcMain } from "electron/main";
import { shell } from "electron";
import { join } from "path";
import { mkdirSync } from "fs";
import type { IpcContext } from "../../../ipc/context";
import { ThunderstoreClient } from "../ThunderstoreClient";
import { ValheimModsManager } from "../ValheimModsManager";

function getManager(ctx: IpcContext, serverId?: string): ValheimModsManager {
  return new ValheimModsManager(
    ctx.getServerPath(serverId),
    ctx.getModsDataDir(serverId),
  );
}

export function registerValheimModsHandlers(ctx: IpcContext): void {
  // --- Browse Thunderstore (public, sans clé API) ---

  ipcMain.handle("valheim:mods:getTrending", () =>
    ThunderstoreClient.getTrending(),
  );

  ipcMain.handle("valheim:mods:getLatestAdded", () =>
    ThunderstoreClient.getLatestAdded(),
  );

  ipcMain.handle("valheim:mods:getLatestUpdated", () =>
    ThunderstoreClient.getLatestUpdated(),
  );

  ipcMain.handle("valheim:mods:search", (_, query: string) =>
    ThunderstoreClient.search(query),
  );

  // getModFiles prend maintenant (namespace, name) — les versions du package Thunderstore
  ipcMain.handle(
    "valheim:mods:getModFiles",
    (_, namespace: string, name: string) =>
      ThunderstoreClient.getPackage(namespace, name).then(
        ThunderstoreClient.toModFiles,
      ),
  );

  // --- Gestion locale des mods installés ---

  ipcMain.handle("valheim:mods:detectBepInEx", (_, serverId?: string) =>
    getManager(ctx, serverId).detectBepInEx(),
  );

  ipcMain.handle("valheim:mods:list", (_, serverId?: string) =>
    getManager(ctx, serverId).list(),
  );

  ipcMain.handle("valheim:mods:openPluginsFolder", (_, serverId?: string) => {
    const dir = join(ctx.getServerPath(serverId), "BepInEx", "plugins");
    mkdirSync(dir, { recursive: true });
    return shell.openPath(dir);
  });

  ipcMain.handle("valheim:mods:openConfigFolder", (_, serverId?: string) => {
    const dir = join(ctx.getServerPath(serverId), "BepInEx", "config");
    mkdirSync(dir, { recursive: true });
    return shell.openPath(dir);
  });

  ipcMain.handle("valheim:mods:remove", (_, modId: number, serverId?: string) =>
    getManager(ctx, serverId).remove(modId),
  );

  ipcMain.handle(
    "valheim:mods:toggle",
    (_, modId: number, enabled: boolean, serverId?: string) =>
      getManager(ctx, serverId).toggle(modId, enabled),
  );

  ipcMain.handle(
    "valheim:mods:installBepInEx",
    async (event, serverId?: string) =>
      getManager(ctx, serverId).installBepInEx((msg) =>
        event.sender.send("valheim:mods:progress", msg),
      ),
  );

  ipcMain.handle(
    "valheim:mods:installFromThunderstore",
    async (event, code: string, serverId?: string) =>
      getManager(ctx, serverId).installFromThunderstore(code, (msg) =>
        event.sender.send("valheim:mods:progress", msg),
      ),
  );

  ipcMain.handle(
    "valheim:mods:importProfile",
    async (event, base64Code: string, serverId?: string) => {
      const manager = getManager(ctx, serverId);
      const codes = await manager.parseThunderstoreProfile(base64Code);
      const results: Awaited<
        ReturnType<typeof manager.installFromThunderstore>
      >[] = [];
      const errors: string[] = [];
      for (const code of codes) {
        try {
          const mod = await manager.installFromThunderstore(code, (msg) =>
            event.sender.send("valheim:mods:progress", msg),
          );
          results.push(mod);
        } catch (e) {
          errors.push(`${code}: ${(e as Error).message}`);
          event.sender.send(
            "valheim:mods:progress",
            `⚠ ${code} — ${(e as Error).message}`,
          );
        }
      }
      return { installed: results, errors };
    },
  );

  ipcMain.handle(
    "valheim:mods:getMissingDeps",
    (_, namespace: string, name: string, installedCodes: string[]) =>
      ThunderstoreClient.getMissingDeps(namespace, name, installedCodes),
  );

  ipcMain.handle("valheim:mods:checkUpdates", (_, installedCodes: string[]) =>
    ThunderstoreClient.checkUpdates(installedCodes),
  );
}
