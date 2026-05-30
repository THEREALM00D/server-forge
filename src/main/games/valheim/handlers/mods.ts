import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import { NexusModsClient, parseNxmUrl } from "../NexusModsClient";
import { ValheimModsManager } from "../ValheimModsManager";

function getClient(ctx: IpcContext, serverId?: string): NexusModsClient {
  const key = ctx.getValheimModsApiKey(serverId);
  if (!key) throw new Error("Clé API NexusMods non configurée");
  return new NexusModsClient(key);
}

function getManager(ctx: IpcContext, serverId?: string): ValheimModsManager {
  return new ValheimModsManager(
    ctx.getServerPath(serverId),
    ctx.getModsDataDir(serverId),
  );
}

export function registerValheimModsHandlers(ctx: IpcContext): void {
  ipcMain.handle("valheim:mods:validateKey", (_, key: string) =>
    new NexusModsClient(key).validateApiKey(),
  );

  ipcMain.handle(
    "valheim:mods:setApiKey",
    (_, key: string, serverId?: string) => {
      ctx.setValheimModsApiKey(key, serverId);
    },
  );

  ipcMain.handle("valheim:mods:getApiKey", (_, serverId?: string) =>
    ctx.getValheimModsApiKey(serverId),
  );

  ipcMain.handle("valheim:mods:detectBepInEx", (_, serverId?: string) =>
    getManager(ctx, serverId).detectBepInEx(),
  );

  ipcMain.handle("valheim:mods:list", (_, serverId?: string) =>
    getManager(ctx, serverId).list(),
  );

  // Trending public v3 : pas de clé API requise (top 5)
  ipcMain.handle("valheim:mods:getTrendingPublic", () =>
    NexusModsClient.getTrendingPublic(),
  );

  ipcMain.handle("valheim:mods:getTrending", (_, serverId?: string) =>
    getClient(ctx, serverId).getTrending(),
  );

  ipcMain.handle("valheim:mods:getLatestAdded", (_, serverId?: string) =>
    getClient(ctx, serverId).getLatestAdded(),
  );

  ipcMain.handle("valheim:mods:getLatestUpdated", (_, serverId?: string) =>
    getClient(ctx, serverId).getLatestUpdated(),
  );

  ipcMain.handle("valheim:mods:getMod", (_, modId: number, serverId?: string) =>
    getClient(ctx, serverId).getMod(modId),
  );

  ipcMain.handle(
    "valheim:mods:getModFiles",
    (_, modId: number, serverId?: string) =>
      getClient(ctx, serverId).getModFiles(modId),
  );

  ipcMain.handle(
    "valheim:mods:installFromNxm",
    async (event, nxmUrl: string, serverId?: string) => {
      const { modId, fileId, key, expires } = parseNxmUrl(nxmUrl);
      const client = getClient(ctx, serverId);
      const [mod, files] = await Promise.all([
        client.getMod(modId),
        client.getModFiles(modId),
      ]);
      const file = files.find((f) => f.file_id === fileId);
      if (!file)
        throw new Error(`Fichier ${fileId} introuvable pour le mod ${modId}`);
      const downloadUrl = await client.getDownloadUrl(
        modId,
        fileId,
        key,
        expires,
      );
      return getManager(ctx, serverId).install(mod, file, downloadUrl, (msg) =>
        event.sender.send("valheim:mods:progress", msg),
      );
    },
  );

  ipcMain.handle("valheim:mods:remove", (_, modId: number, serverId?: string) =>
    getManager(ctx, serverId).remove(modId),
  );

  ipcMain.handle(
    "valheim:mods:toggle",
    (_, modId: number, enabled: boolean, serverId?: string) =>
      getManager(ctx, serverId).toggle(modId, enabled),
  );
}
