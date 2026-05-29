import type { PalConfigParser } from "../games/palworld/PalConfigParser";
import type { ServerRegistry } from "./ServerRegistry";
import type { ServerManagerRegistry } from "./ServerManagerRegistry";

export interface PortConflict {
  serverId: string;
  serverName: string;
  port: number;
  protocol: "game" | "rcon" | "restapi";
}

interface ServerPorts {
  game: number;
  rcon: number | null;
  restApi: number | null;
}

function readPorts(
  serverPath: string,
  configParser: PalConfigParser,
): ServerPorts | null {
  if (!serverPath) return null;
  try {
    const cfg = configParser.read(serverPath);
    return {
      game: Number(cfg.PublicPort ?? 8211),
      rcon: cfg.RCONEnabled ? Number(cfg.RCONPort ?? 25575) : null,
      restApi: cfg.RESTAPIEnabled ? Number(cfg.RESTAPIPort ?? 8212) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Vérifie qu'aucun autre serveur déjà démarré n'utilise les mêmes ports que
 * celui qu'on s'apprête à lancer. Renvoie la liste des conflits trouvés (vide
 * si OK).
 */
export function detectPortConflicts(
  startingServerId: string,
  servers: ServerRegistry,
  managers: ServerManagerRegistry,
  configParser: PalConfigParser,
): PortConflict[] {
  const all = servers.list();
  const target = all.find((s) => s.id === startingServerId);
  if (!target) return [];

  const targetPorts = readPorts(target.path, configParser);
  if (!targetPorts) return [];

  const statuses = managers.statuses();
  const conflicts: PortConflict[] = [];

  for (const other of all) {
    if (other.id === startingServerId) continue;
    const otherStatus = statuses[other.id];
    if (otherStatus !== "running" && otherStatus !== "starting") continue;

    const otherPorts = readPorts(other.path, configParser);
    if (!otherPorts) continue;

    if (targetPorts.game === otherPorts.game) {
      conflicts.push({
        serverId: other.id,
        serverName: other.name,
        port: targetPorts.game,
        protocol: "game",
      });
    }
    if (
      targetPorts.rcon !== null &&
      otherPorts.rcon !== null &&
      targetPorts.rcon === otherPorts.rcon
    ) {
      conflicts.push({
        serverId: other.id,
        serverName: other.name,
        port: targetPorts.rcon,
        protocol: "rcon",
      });
    }
    if (
      targetPorts.restApi !== null &&
      otherPorts.restApi !== null &&
      targetPorts.restApi === otherPorts.restApi
    ) {
      conflicts.push({
        serverId: other.id,
        serverName: other.name,
        port: targetPorts.restApi,
        protocol: "restapi",
      });
    }
  }

  return conflicts;
}

export function formatConflictsError(conflicts: PortConflict[]): string {
  const lines = conflicts.map(
    (c) =>
      `${c.protocol.toUpperCase()} ${c.port} (déjà utilisé par « ${c.serverName} »)`,
  );
  return `Conflit de ports : ${lines.join(", ")}`;
}
