import si from "systeminformation";
import type { GameType, SystemStats } from "../../shared/types";
import { PROCESS_NAME_PREFIXES } from "../servers/ServerManagerRegistry";

export class SystemMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async getStats(gameType: GameType = "palworld"): Promise<SystemStats> {
    const [cpuLoad, mem, sysTime, procs] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time(),
      si.processes(),
    ]);

    const prefix = PROCESS_NAME_PREFIXES[gameType] ?? "palserver";
    const gameProcs = procs.list.filter((p) =>
      p.name.toLowerCase().startsWith(prefix),
    );
    // Le lanceur peut consommer peu de RAM face au vrai process serveur
    // (ex. PalServer.exe vs PalServer-Win64-Shipping.exe) — on prend le plus
    // gourmand des process matchant le préfixe pour couvrir les deux cas.
    const gameProc = gameProcs.reduce<(typeof gameProcs)[number] | undefined>(
      (best, p) => (!best || p.memRss > best.memRss ? p : best),
      undefined,
    );

    const ramUsedByGame = gameProc
      ? parseFloat((gameProc.memRss / 1024 ** 2).toFixed(2))
      : 0;

    const serverUptime = gameProc?.started
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(gameProc.started).getTime()) / 1000,
          ),
        )
      : 0;

    return {
      cpu: Math.round(cpuLoad.currentLoad),
      ram: Math.round((mem.used / mem.total) * 100),
      ramUsed: parseFloat((mem.used / 1024 ** 3).toFixed(2)),
      ramTotal: parseFloat((mem.total / 1024 ** 3).toFixed(2)),
      ramUsedByGame,
      serverUptime,
      uptime: sysTime.uptime,
    };
  }

  startPolling(
    intervalMs: number,
    onStats: (stats: SystemStats) => void,
    getGameType: () => GameType = () => "palworld",
  ): void {
    this.stopPolling();
    this.intervalId = setInterval(async () => {
      const stats = await this.getStats(getGameType());
      onStats(stats);
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
