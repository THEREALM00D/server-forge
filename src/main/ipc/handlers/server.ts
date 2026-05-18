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
    return ctx.requireActiveManager().start(serverPath, args, (line) => {
      event.sender.send("server:log", line);
    });
  });

  ipcMain.handle("server:stop", () =>
    ctx.requireActiveManager().stop(ctx.getStopConfig()),
  );

  ipcMain.handle("server:restart", async (event) => {
    const serverPath = ctx.getActiveServerPath();
    const args = buildServerArgs(ctx.getServerConfig().launchArgs);
    return ctx
      .requireActiveManager()
      .restart(
        serverPath,
        args,
        (line) => event.sender.send("server:log", line),
        ctx.getStopConfig(),
      );
  });

  // Lecture seule : retourne "stopped" si aucun serveur actif (évite de planter
  // le renderer qui poll status au boot avant qu'un serveur ne soit configuré).
  ipcMain.handle(
    "server:status",
    () => ctx.serverManagers.getActive()?.getStatus() ?? "stopped",
  );

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
