import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { LaunchArgsConfig } from "../../../shared/types";

const PERFORMANCE_FLAGS = [
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
];

export function buildServerArgs(cfg: LaunchArgsConfig): string[] {
  const args: string[] = [];
  if (cfg.publicLobby) args.push("-publiclobby");
  if (cfg.performanceFlags) args.push(...PERFORMANCE_FLAGS);
  const custom = cfg.customArgs.trim();
  if (custom) args.push(...custom.split(/\s+/));
  return args;
}

export function registerServerHandlers(ctx: IpcContext): void {
  ipcMain.handle("server:start", async (event) => {
    const serverPath = ctx.getActiveServerPath();
    const args = buildServerArgs(ctx.getServerConfig().launchArgs);
    return ctx.serverManager.start(serverPath, args, (line) => {
      event.sender.send("server:log", line);
    });
  });

  ipcMain.handle("server:stop", () =>
    ctx.serverManager.stop(ctx.getStopConfig()),
  );

  ipcMain.handle("server:restart", async (event) => {
    const serverPath = ctx.getActiveServerPath();
    const args = buildServerArgs(ctx.getServerConfig().launchArgs);
    return ctx.serverManager.restart(
      serverPath,
      args,
      (line) => event.sender.send("server:log", line),
      ctx.getStopConfig(),
    );
  });

  ipcMain.handle("server:status", () => ctx.serverManager.getStatus());

  // Launch arguments — désormais stockés par-serveur dans ServerConfig
  ipcMain.handle(
    "server:getLaunchArgs",
    () => ctx.getServerConfig().launchArgs,
  );
  ipcMain.handle("server:setLaunchArgs", (_, cfg: LaunchArgsConfig) => {
    ctx.updateServerConfig(undefined, { launchArgs: cfg });
  });

  // Palworld .ini config
  ipcMain.handle("palconfig:read", async () => {
    const serverPath = ctx.getActiveServerPath();
    return ctx.configParser.read(serverPath);
  });
  ipcMain.handle(
    "palconfig:write",
    async (_, settings: Record<string, string | number | boolean>) => {
      const serverPath = ctx.getActiveServerPath();
      return ctx.configParser.write(serverPath, settings);
    },
  );
}
