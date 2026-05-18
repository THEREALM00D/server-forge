import si from "systeminformation";
import { ServerManager } from "../server/ServerManager";
import type { ServerStatus, Server } from "../../shared/types";
import type { ServerRegistry } from "./ServerRegistry";

/**
 * Garde une instance `ServerManager` par serveur, indexée par `serverId`.
 * Permet à terme de faire tourner plusieurs serveurs en parallèle (Phase 5).
 * Pour l'instant l'UI ne pilote qu'un seul serveur à la fois, mais le backend
 * est déjà capable d'en gérer N.
 */
export class ServerManagerRegistry {
  private managers = new Map<string, ServerManager>();

  constructor(private servers: ServerRegistry) {}

  /**
   * Récupère le manager pour ce serveur, en le créant si nécessaire.
   * Lance si le serverId n'existe pas dans le registre des serveurs.
   */
  getOrCreate(serverId: string): ServerManager {
    if (!this.servers.list().some((s) => s.id === serverId)) {
      throw new Error(`Serveur introuvable : ${serverId}`);
    }
    let mgr = this.managers.get(serverId);
    if (!mgr) {
      mgr = new ServerManager();
      this.managers.set(serverId, mgr);
    }
    return mgr;
  }

  /** Retourne le manager du serveur actif, ou null si aucun n'est sélectionné. */
  getActive(): ServerManager | null {
    const active = this.servers.getActive();
    if (!active) return null;
    return this.getOrCreate(active.id);
  }

  /** Itère sur tous les managers existants (instanciés au moins une fois). */
  entries(): Array<{ serverId: string; manager: ServerManager }> {
    return Array.from(this.managers.entries()).map(([serverId, manager]) => ({
      serverId,
      manager,
    }));
  }

  /**
   * Status agrégé : pour chaque serveur du registre, retourne son statut.
   * Si aucun manager n'a été instancié pour ce serveur, retourne "stopped".
   */
  statuses(): Record<string, ServerStatus> {
    const result: Record<string, ServerStatus> = {};
    for (const s of this.servers.list()) {
      result[s.id] = this.managers.get(s.id)?.getStatus() ?? "stopped";
    }
    return result;
  }

  /**
   * Détecte les processus PalServer.exe en cours et tente d'associer chacun
   * au serveur correspondant via le chemin de l'exécutable. Si on trouve un
   * process avec un chemin qui matche `server.path`, ce serveur passe en
   * `running` et son manager est créé/adopté.
   */
  async tryAdoptAll(onLog: (line: string) => void): Promise<void> {
    let procs;
    try {
      procs = await si.processes();
    } catch {
      return;
    }
    const palProcs = procs.list.filter((p) =>
      p.name.toLowerCase().startsWith("palserver"),
    );
    if (palProcs.length === 0) return;

    for (const server of this.servers.list()) {
      const match = this.matchProcessToServer(palProcs, server);
      if (!match) continue;
      const mgr = this.getOrCreate(server.id);
      // ServerManager.tryAdopt() s'occupe de scanner et d'adopter. On lui
      // donne juste le hook de log ; il refera la détection lui-même.
      await mgr.tryAdopt(onLog).catch(() => {});
    }
  }

  private matchProcessToServer(
    procs: Array<{ name: string; path?: string; params?: string }>,
    server: Server,
  ): boolean {
    const needle = server.path.toLowerCase().replace(/\\/g, "/");
    return procs.some((p) => {
      const haystack = `${p.path ?? ""} ${p.params ?? ""}`
        .toLowerCase()
        .replace(/\\/g, "/");
      return haystack.includes(needle);
    });
  }
}
