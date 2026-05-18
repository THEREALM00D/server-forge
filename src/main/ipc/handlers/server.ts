import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { LaunchArgsConfig } from "../../../shared/types";
import type Store from "electron-store";
import type { AppStore } from "../context";

const PERFORMANCE_FLAGS = [
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
];

const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

export function getLaunchArgs(store: Store<AppStore>): LaunchArgsConfig {
  return store.get("launchArgs", DEFAULT_LAUNCH_ARGS);
}

export function buildServerArgs(store: Store<AppStore>): string[] {
  const cfg = getLaunchArgs(store);
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
    const args = buildServerArgs(ctx.store);
    return ctx.serverManager.start(serverPath, args, (line) => {
      event.sender.send("server:log", line);
    });
  });

  ipcMain.handle("server:stop", () =>
    ctx.serverManager.stop(ctx.getStopConfig()),
  );

  ipcMain.handle("server:restart", async (event) => {
    const serverPath = ctx.getActiveServerPath();
    const args = buildServerArgs(ctx.store);
    return ctx.serverManager.restart(
      serverPath,
      args,
      (line) => event.sender.send("server:log", line),
      ctx.getStopConfig(),
    );
  });

  ipcMain.handle("server:status", () => ctx.serverManager.getStatus());

  // Launch arguments
  ipcMain.handle("server:getLaunchArgs", () => getLaunchArgs(ctx.store));
  ipcMain.handle("server:setLaunchArgs", (_, cfg: LaunchArgsConfig) => {
    ctx.store.set("launchArgs", cfg);
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
