export const dialogService = {
  selectFolder: (): Promise<string | null> => window.api.dialog.selectFolder(),
  selectFile: (
    filters?: { name: string; extensions: string[] }[],
  ): Promise<string | null> => window.api.dialog.selectFile(filters),
};
