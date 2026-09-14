import { ipcMain, app } from "electron/main";
import { checkForUpdate } from "../../update/UpdateChecker";

export function registerUpdateHandlers(): void {
  ipcMain.handle("update:check", async () => {
    try {
      return await checkForUpdate(app.getVersion());
    } catch (e) {
      return { error: (e as Error).message };
    }
  });
}
