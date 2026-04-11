export const configService = {
  getServerPath: (): Promise<string> => window.api.config.getServerPath(),
  setServerPath: (path: string): Promise<void> => window.api.config.setServerPath(path),
  readPalConfig: (): Promise<Record<string, string | number | boolean>> =>
    window.api.palconfig.read(),
  writePalConfig: (
    settings: Record<string, string | number | boolean>
  ): Promise<{ success: boolean; error?: string }> =>
    window.api.palconfig.write(settings),
}
