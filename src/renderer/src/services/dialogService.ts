export const dialogService = {
  selectFolder: (): Promise<string | null> => window.api.dialog.selectFolder(),
}
