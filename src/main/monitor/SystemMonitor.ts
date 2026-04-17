import si from "systeminformation";
import type { SystemStats } from "../../shared/types";

export class SystemMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async getStats(): Promise<SystemStats> {
    const [cpuLoad, mem, sysTime, procs] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time(),
      si.processes(),
    ]);

    const palProc = procs.list.find((p) =>
      p.name.toLowerCase().startsWith("palserver"),
    );

    const ramUsedByGame = palProc
      ? parseFloat((palProc.memRss / 1024 ** 2).toFixed(2))
      : 0;

    const serverUptime = palProc?.started
      ? Math.max(
          0,
          Math.floor((Date.now() - new Date(palProc.started).getTime()) / 1000),
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
  ): void {
    this.stopPolling();
    this.intervalId = setInterval(async () => {
      const stats = await this.getStats();
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
