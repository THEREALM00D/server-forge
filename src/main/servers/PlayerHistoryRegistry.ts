import { join } from "path";
import { existsSync, copyFileSync, mkdirSync } from "fs";
import { PlayerHistoryTracker } from "../players/PlayerHistoryTracker";
import type { ServerRegistry } from "./ServerRegistry";

/**
 * Garde une instance `PlayerHistoryTracker` par serveur. Chaque tracker écrit
 * dans son propre `{userDataPath}/servers/<id>/players/history.json`.
 */
export class PlayerHistoryRegistry {
  private trackers = new Map<string, PlayerHistoryTracker>();

  constructor(
    private userDataPath: string,
    private servers: ServerRegistry,
  ) {}

  getOrCreate(serverId: string): PlayerHistoryTracker {
    let tracker = this.trackers.get(serverId);
    if (!tracker) {
      tracker = new PlayerHistoryTracker(this.userDataPath, serverId);
      this.trackers.set(serverId, tracker);
    }
    return tracker;
  }

  getActive(): PlayerHistoryTracker | null {
    const active = this.servers.getActive();
    if (!active) return null;
    return this.getOrCreate(active.id);
  }

  /**
   * Migre l'ancien `{userDataPath}/players/history.json` partagé vers le
   * storage du premier serveur. Copie le fichier (on garde le legacy pour
   * éviter une perte si une vieille version de l'app est encore installée
   * en dual-boot). No-op si la destination existe déjà ou si pas de legacy.
   */
  migrateLegacy(firstServerId: string): void {
    const legacy = join(this.userDataPath, "players", "history.json");
    if (!existsSync(legacy)) return;

    const targetDir = join(
      this.userDataPath,
      "servers",
      firstServerId,
      "players",
    );
    const target = join(targetDir, "history.json");
    if (existsSync(target)) return;

    mkdirSync(targetDir, { recursive: true });
    try {
      copyFileSync(legacy, target);
    } catch {
      // ignore — au pire on repart d'un historique vide
    }
  }

  /** Stoppe tous les trackers actifs (à appeler à la fermeture de l'app). */
  stopAll(): void {
    for (const t of this.trackers.values()) t.stop();
  }

  /** Stoppe et retire le tracker d'un serveur (à appeler avant sa suppression). */
  remove(serverId: string): void {
    const tracker = this.trackers.get(serverId);
    if (!tracker) return;
    tracker.stop();
    this.trackers.delete(serverId);
  }
}
