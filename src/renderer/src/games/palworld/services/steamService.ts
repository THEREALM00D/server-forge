import type { OperationResult } from '../../../types'

export const steamService = {
  isInstalled: (): Promise<boolean> => window.api.steamcmd.isInstalled(),
  install: (): Promise<OperationResult> => window.api.steamcmd.install(),
  installPalworld: (path: string): Promise<OperationResult> =>
    window.api.steamcmd.installPalworld(path),
  updatePalworld: (): Promise<OperationResult> => window.api.steamcmd.updatePalworld(),
  checkForUpdate: () => window.api.steamcmd.checkForUpdate(),
  onProgress: (cb: (msg: string) => void) => window.api.steamcmd.onProgress(cb),
}
