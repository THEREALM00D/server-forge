import si from 'systeminformation'

export interface SystemStats {
  cpu: number        // Usage %
  ram: number        // Usage %
  ramUsed: number    // GB
  ramTotal: number   // GB
  uptime: number     // seconds
}

export class SystemMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null

  async getStats(): Promise<SystemStats> {
    const [cpuLoad, mem] = await Promise.all([si.currentLoad(), si.mem()])

    return {
      cpu: Math.round(cpuLoad.currentLoad),
      ram: Math.round((mem.used / mem.total) * 100),
      ramUsed: parseFloat((mem.used / 1024 ** 3).toFixed(2)),
      ramTotal: parseFloat((mem.total / 1024 ** 3).toFixed(2)),
      uptime: process.uptime()
    }
  }

  startPolling(intervalMs: number, onStats: (stats: SystemStats) => void): void {
    this.stopPolling()
    this.intervalId = setInterval(async () => {
      const stats = await this.getStats()
      onStats(stats)
    }, intervalMs)
  }

  stopPolling(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
