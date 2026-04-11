import type { SystemStats } from '../types'

export const monitorService = {
  startPolling: (): Promise<void> => window.api.monitor.startPolling(),
  stopPolling: (): Promise<void> => window.api.monitor.stopPolling(),
  getStats: (): Promise<SystemStats> =>
    window.api.monitor.getStats() as Promise<SystemStats>,
  onStats: (cb: (stats: SystemStats) => void) =>
    window.api.monitor.onStats(cb as (stats: unknown) => void),
}
