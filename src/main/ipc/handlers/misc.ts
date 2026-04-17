import { ipcMain, BrowserWindow, dialog } from "electron/main";
import type { IpcContext } from "../context";

export function registerMiscHandlers(ctx: IpcContext): void {
  // Window controls
  ipcMain.handle("window:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("window:maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.handle("window:close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  // Dialog
  ipcMain.handle("dialog:selectFolder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // App
  ipcMain.handle("app:getVersion", () => ctx.app.getVersion());

  // Persistent config
  ipcMain.handle("config:getServerPath", () => ctx.store.get("serverPath", ""));
  ipcMain.handle("config:setServerPath", (_, path: string) =>
    ctx.store.set("serverPath", path),
  );

  // System monitoring
  ipcMain.handle("monitor:getStats", () => ctx.systemMonitor.getStats());
  ipcMain.handle("monitor:startPolling", (event) => {
    ctx.systemMonitor.startPolling(2000, (stats) => {
      event.sender.send("monitor:stats", stats);
    });
  });
  ipcMain.handle("monitor:stopPolling", () => ctx.systemMonitor.stopPolling());
}
