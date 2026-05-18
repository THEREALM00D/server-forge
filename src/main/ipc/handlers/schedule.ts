import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { RestartConfig } from "../../../shared/types";

export function registerScheduleHandlers(ctx: IpcContext): void {
  ipcMain.handle("schedule:getRestart", () => ctx.getRestartConfig());
  ipcMain.handle("schedule:setRestart", (_, cfg: RestartConfig) => {
    ctx.updateServerConfig(undefined, { restart: cfg });
  });
}
