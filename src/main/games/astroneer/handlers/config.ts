import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  AstroneerLaunchConfig,
  AstroneerSettings,
} from "../../../../shared/types";

export function registerAstroneerHandlers(ctx: IpcContext): void {
  // Launch config (customArgs) — stocké dans ServerConfig, comme les autres jeux.
  ipcMain.handle("astroneer:getConfig", (_, serverId?: string) =>
    ctx.getAstroneerConfig(serverId),
  );
  ipcMain.handle(
    "astroneer:setConfig",
    (_, cfg: Partial<AstroneerLaunchConfig>, serverId?: string) => {
      ctx.updateAstroneerConfig(serverId, cfg);
    },
  );

  // Config .ini (Engine.ini + AstroServerSettings.ini fusionnés)
  ipcMain.handle("astroconfig:read", async (_, serverId?: string) => {
    return ctx.astroConfigParser.read(ctx.getServerPath(serverId));
  });
  ipcMain.handle(
    "astroconfig:write",
    async (_, settings: AstroneerSettings, serverId?: string) => {
      return ctx.astroConfigParser.write(ctx.getServerPath(serverId), settings);
    },
  );
}
