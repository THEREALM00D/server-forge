import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";

export function registerPlayersHandlers(ctx: IpcContext): void {
  ipcMain.handle("players:getHistory", () => ctx.playerHistory.list());
  ipcMain.handle("players:clearHistory", () => {
    ctx.playerHistory.clear();
  });
  ipcMain.handle("players:removeEntry", (_, userId: string) => {
    ctx.playerHistory.remove(userId);
  });
}
