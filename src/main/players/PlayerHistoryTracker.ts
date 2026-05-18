import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { PalworldApiClient } from "../server/PalworldApiClient";
import type { PlayerHistoryEntry, PalPlayer } from "../../shared/types";

const POLL_INTERVAL_MS = 30_000;

export class PlayerHistoryTracker {
  private timer: NodeJS.Timeout | null = null;
  private filePath: string;
  private entries: Map<string, PlayerHistoryEntry> = new Map();
  private getClient: (() => PalworldApiClient | null) | null = null;
  private onJoin?: (entry: PlayerHistoryEntry) => void;
  private onLeave?: (entry: PlayerHistoryEntry) => void;

  constructor(userDataPath: string, serverId?: string) {
    // Phase 2c : storage par-serveur dans {userDataPath}/servers/<id>/players.
    // Si `serverId` est omis, on retombe sur l'ancien path partagé pour rester
    // rétrocompatible (pas de migration cassante pendant une mise à jour).
    const dir = serverId
      ? join(userDataPath, "servers", serverId, "players")
      : join(userDataPath, "players");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.filePath = join(dir, "history.json");
    this.load();
  }

  private load(): void {
    if (!existsSync(this.filePath)) return;
    try {
      const raw = readFileSync(this.filePath, "utf-8");
      const data = JSON.parse(raw) as PlayerHistoryEntry[];
      data.forEach((e) => this.entries.set(e.userId, e));
    } catch {
      // fichier corrompu — on repart à zéro
    }
  }

  private save(): void {
    try {
      const data = Array.from(this.entries.values());
      writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // ignore
    }
  }

  start(
    getClient: () => PalworldApiClient | null,
    callbacks?: {
      onJoin?: (entry: PlayerHistoryEntry) => void;
      onLeave?: (entry: PlayerHistoryEntry) => void;
    },
  ): void {
    this.stop();
    this.getClient = getClient;
    this.onJoin = callbacks?.onJoin;
    this.onLeave = callbacks?.onLeave;
    this.poll();
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Marquer toutes les sessions courantes comme terminées
    this.markAllOffline();
  }

  private markAllOffline(): void {
    const now = Date.now();
    let changed = false;
    this.entries.forEach((entry) => {
      if (entry.online) {
        this.closeSession(entry, now);
        changed = true;
      }
    });
    if (changed) this.save();
  }

  private closeSession(entry: PlayerHistoryEntry, now: number): void {
    const start = entry.currentSessionStart ?? now;
    const duration = Math.max(0, now - start);
    entry.totalPlaytimeMs += duration;
    entry.online = false;
    entry.lastSeen = now;
    const last = entry.sessions[entry.sessions.length - 1];
    if (last && last.leaveAt === null) last.leaveAt = now;
    entry.currentSessionStart = null;
  }

  private async poll(): Promise<void> {
    const client = this.getClient?.();
    if (!client) return;
    try {
      const res = await client.getPlayers();
      this.applyPlayers(res.players ?? []);
    } catch {
      // serveur offline ou API non dispo — pas d'erreur fatale
    }
  }

  private applyPlayers(players: PalPlayer[]): void {
    const now = Date.now();
    const onlineIds = new Set(players.map((p) => p.userId));
    let changed = false;

    // Joueurs en ligne : créer ou rouvrir une session
    players.forEach((p) => {
      let entry = this.entries.get(p.userId);
      if (!entry) {
        entry = {
          userId: p.userId,
          playerId: p.playerId,
          name: p.name,
          firstSeen: now,
          lastSeen: now,
          lastIp: p.ip,
          totalPlaytimeMs: 0,
          sessionCount: 0,
          online: false,
          currentSessionStart: null,
          sessions: [],
        };
        this.entries.set(p.userId, entry);
      }
      entry.name = p.name;
      entry.playerId = p.playerId;
      if (p.ip) entry.lastIp = p.ip;
      entry.lastSeen = now;

      if (!entry.online) {
        entry.online = true;
        entry.currentSessionStart = now;
        entry.sessionCount += 1;
        entry.sessions.push({ joinAt: now, leaveAt: null });
        if (entry.sessions.length > 50) entry.sessions.shift();
        changed = true;
        this.onJoin?.(entry);
      }
    });

    // Joueurs précédemment en ligne mais absents de la liste : fermer la session
    this.entries.forEach((entry) => {
      if (entry.online && !onlineIds.has(entry.userId)) {
        this.closeSession(entry, now);
        changed = true;
        this.onLeave?.(entry);
      }
    });

    if (changed) this.save();
  }

  list(): PlayerHistoryEntry[] {
    const now = Date.now();
    return Array.from(this.entries.values())
      .map((e) => {
        if (!e.online) return e;
        // Calcul à la volée du temps de jeu courant
        const start = e.currentSessionStart ?? now;
        return {
          ...e,
          totalPlaytimeMs: e.totalPlaytimeMs + Math.max(0, now - start),
        };
      })
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  clear(): void {
    this.entries.clear();
    this.save();
  }

  remove(userId: string): void {
    if (this.entries.delete(userId)) this.save();
  }
}
