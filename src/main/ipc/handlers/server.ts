import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type {
  GameType,
  LaunchArgsConfig,
  ServerStatus,
  ValheimLaunchConfig,
} from "../../../shared/types";
import {
  detectPortConflicts,
  formatConflictsError,
} from "../../servers/portConflicts";

const PERFORMANCE_FLAGS = [
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
];

const EXE_NAMES: Record<GameType, string> = {
  palworld: "PalServer.exe",
  valheim: "valheim_server.exe",
};

export function buildServerArgs(cfg: LaunchArgsConfig): string[] {
  const args: string[] = [];
  if (cfg.publicLobby) args.push("-publiclobby");
  if (cfg.performanceFlags) args.push(...PERFORMANCE_FLAGS);
  const custom = cfg.customArgs.trim();
  if (custom) args.push(...custom.split(/\s+/));
  return args;
}

export function buildValheimArgs(cfg: ValheimLaunchConfig): string[] {
  const args = ["-nographics", "-batchmode"];
  args.push("-name", cfg.name, "-world", cfg.world);
  args.push("-port", String(cfg.port));
  args.push("-public", cfg.public ? "1" : "0");
  if (cfg.password) args.push("-password", cfg.password);
  if (cfg.savedir) args.push("-savedir", cfg.savedir);
  if (cfg.crossplay) args.push("-crossplay");
  if (cfg.logFile) args.push("-logFile", cfg.logFile);
  if (cfg.worldSeed) args.push("-worldseed", cfg.worldSeed);
  if (cfg.worldSize) args.push("-worldsize", cfg.worldSize);
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
    const server = ctx.servers.list().find((s) => s.id === id);
    const gameType = server?.gameType ?? "palworld";

    // Refuse de démarrer si un autre serveur déjà running utilise les mêmes
    // ports (game/RCON/REST). Évite que PalServer.exe plante silencieusement
    // sur EADDRINUSE et laisse l'utilisateur deviner.
    if (gameType === "palworld") {
      const conflicts = detectPortConflicts(
        id,
        ctx.servers,
        ctx.serverManagers,
        ctx.configParser,
      );
      if (conflicts.length > 0) {
        return { success: false, error: formatConflictsError(conflicts) };
      }
    }

    const serverPath = ctx.getServerPath(id);
    const exeName = EXE_NAMES[gameType];
    const args =
      gameType === "valheim"
        ? buildValheimArgs(ctx.getValheimConfig(id))
        : buildServerArgs(ctx.getServerConfig(id).launchArgs);

    return ctx.serverManagers
      .getOrCreate(id)
      .start(serverPath, exeName, args, (line) => {
        event.sender.send("server:log", { serverId: id, line });
      });
  });

  ipcMain.handle("server:stop", (_, serverId?: string) => {
    const id = resolveId(serverId);
    return ctx.serverManagers.getOrCreate(id).stop(ctx.getStopConfig(id));
  });

  ipcMain.handle("server:restart", async (event, serverId?: string) => {
    const id = resolveId(serverId);
    const server = ctx.servers.list().find((s) => s.id === id);
    const gameType = server?.gameType ?? "palworld";
    const serverPath = ctx.getServerPath(id);
    const exeName = EXE_NAMES[gameType];
    const args =
      gameType === "valheim"
        ? buildValheimArgs(ctx.getValheimConfig(id))
        : buildServerArgs(ctx.getServerConfig(id).launchArgs);
    return ctx.serverManagers
      .getOrCreate(id)
      .restart(
        serverPath,
        exeName,
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
