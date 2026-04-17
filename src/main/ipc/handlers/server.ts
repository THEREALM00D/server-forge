import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";

export function registerServerHandlers(ctx: IpcContext): void {
  ipcMain.handle("server:start", async (event) => {
    const serverPath = ctx.store.get("serverPath", "");
    const args = ctx.store.get("serverArgs", []);
    return ctx.serverManager.start(serverPath, args, (line) => {
      event.sender.send("server:log", line);
    });
  });

  ipcMain.handle("server:stop", () =>
    ctx.serverManager.stop(ctx.getStopConfig()),
  );

  ipcMain.handle("server:restart", async (event) => {
    const serverPath = ctx.store.get("serverPath", "");
    const args = ctx.store.get("serverArgs", []);
    return ctx.serverManager.restart(
      serverPath,
      args,
      (line) => event.sender.send("server:log", line),
      ctx.getStopConfig(),
    );
  });

  ipcMain.handle("server:status", () => ctx.serverManager.getStatus());

  // Palworld .ini config
  ipcMain.handle("palconfig:read", async () => {
    const serverPath = ctx.store.get("serverPath", "");
    return ctx.configParser.read(serverPath);
  });
  ipcMain.handle(
    "palconfig:write",
    async (_, settings: Record<string, string | number | boolean>) => {
      const serverPath = ctx.store.get("serverPath", "");
      return ctx.configParser.write(serverPath, settings);
    },
  );
}
