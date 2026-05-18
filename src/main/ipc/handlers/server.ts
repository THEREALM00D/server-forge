import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { LaunchArgsConfig, ServerStatus } from "../../../shared/types";

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
  // Résout un serverId argumenté en serveur du registre. Fallback : actif.
  const resolveId = (id: string | undefined): string => {
    const resolved = id ?? ctx.getActiveServer()?.id ?? null;
    if (!resolved) throw new Error("Aucun serveur actif configuré");
    return resolved;
  };

  ipcMain.handle("server:start", async (event, serverId?: string) => {
    const id = resolveId(serverId);
    const serverPath = ctx.getServerPath(id);
    const args = buildServerArgs(ctx.getServerConfig(id).launchArgs);
    return ctx.serverManagers
      .getOrCreate(id)
      .start(serverPath, args, (line) => {
        event.sender.send("server:log", { serverId: id, line });
      });
  });

  ipcMain.handle("server:stop", (_, serverId?: string) => {
    const id = resolveId(serverId);
    return ctx.serverManagers.getOrCreate(id).stop(ctx.getStopConfig(id));
  });

  ipcMain.handle("server:restart", async (event, serverId?: string) => {
    const id = resolveId(serverId);
    const serverPath = ctx.getServerPath(id);
    const args = buildServerArgs(ctx.getServerConfig(id).launchArgs);
    return ctx.serverManagers
      .getOrCreate(id)
      .restart(
        serverPath,
        args,
        (line) => event.sender.send("server:log", { serverId: id, line }),
        ctx.getStopConfig(id),
      );
  });

  // Compat : status du serveur actif. Retourne "stopped" si aucun actif.
  ipcMain.handle(
    "server:status",
    () => ctx.serverManagers.getActive()?.getStatus() ?? "stopped",
  );

  // Phase 5 : statuses agrégés pour tous les serveurs configurés.
  ipcMain.handle(
    "server:statuses",
    (): Record<string, ServerStatus> => ctx.serverManagers.statuses(),
  );

  // Launch arguments — stockés par-serveur. serverId optionnel = actif.
  ipcMain.handle(
    "server:getLaunchArgs",
    (_, serverId?: string) => ctx.getServerConfig(serverId).launchArgs,
  );
  ipcMain.handle(
    "server:setLaunchArgs",
    (_, cfg: LaunchArgsConfig, serverId?: string) => {
      ctx.updateServerConfig(serverId, { launchArgs: cfg });
    },
  );

  // Palworld .ini config
  ipcMain.handle("palconfig:read", async (_, serverId?: string) => {
    return ctx.configParser.read(ctx.getServerPath(serverId));
  });
  ipcMain.handle(
    "palconfig:write",
    async (
      _,
      settings: Record<string, string | number | boolean>,
      serverId?: string,
    ) => {
      return ctx.configParser.write(ctx.getServerPath(serverId), settings);
    },
  );
}
