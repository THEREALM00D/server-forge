import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";

export function registerSteamHandlers(ctx: IpcContext): void {
  ipcMain.handle("steamcmd:isInstalled", () => ctx.steamcmd.isInstalled());

  ipcMain.handle("steamcmd:install", async (event) => {
    return ctx.steamcmd.install((progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle(
    "steamcmd:installPalworld",
    async (event, installPath: string) => {
      ctx.store.set("serverPath", installPath);
      return ctx.steamcmd.installPalworld(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updatePalworld", async (event) => {
    const installPath = ctx.store.get("serverPath", "");
    return ctx.steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = ctx.store.get("serverPath", "");
    return ctx.steamcmd.checkForUpdate(installPath);
  });
}
