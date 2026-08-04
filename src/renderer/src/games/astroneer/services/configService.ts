export const astroConfigService = {
  readConfig: (): Promise<Record<string, string | number | boolean>> =>
    window.api.astroconfig.read(),
  writeConfig: (
    settings: Record<string, string | number | boolean>,
  ): Promise<{ success: boolean; error?: string }> =>
    window.api.astroconfig.write(settings),
};
