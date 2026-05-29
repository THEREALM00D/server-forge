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
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installPalworld(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updatePalworld", async (event) => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle(
    "steamcmd:installValheim",
    async (event, installPath: string) => {
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installValheim(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updateValheim", async (event) => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.installValheim(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.checkForUpdate(installPath);
  });
}
