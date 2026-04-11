import type { OperationResult, ServerStatus } from '../types'

export const serverService = {
  start: (): Promise<OperationResult> => window.api.server.start(),
  stop: (): Promise<OperationResult> => window.api.server.stop(),
  restart: (): Promise<OperationResult> => window.api.server.restart(),
  getStatus: (): Promise<ServerStatus> =>
    window.api.server.getStatus() as Promise<ServerStatus>,
  onLog: (cb: (line: string) => void) => window.api.server.onLog(cb),
}
