export interface RestartConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
  warningMinutes: number;
  message: string;
}

export class RestartScheduler {
  private timer: NodeJS.Timeout | null = null;
  private lastRunKey: string | null = null;

  start(
    getConfig: () => RestartConfig,
    onRestart: (cfg: RestartConfig) => Promise<void>,
  ): void {
    this.stop();
    this.timer = setInterval(() => {
      const cfg = getConfig();
      if (!cfg.enabled) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;
      if (current !== cfg.time) return;
      const key = `${now.toDateString()}-${current}`;
      if (this.lastRunKey === key) return;
      this.lastRunKey = key;
      onRestart(cfg).catch(() => {});
    }, 30 * 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
