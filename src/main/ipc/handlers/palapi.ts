import { ipcMain } from "electron/main";
import { PalworldApiClient } from "../../server/PalworldApiClient";
import type { IpcContext } from "../context";

export function registerPalapiHandlers(ctx: IpcContext): void {
  const getClient = (): PalworldApiClient => {
    const serverPath = ctx.store.get("serverPath", "");
    const cfg = ctx.configParser.read(serverPath);
    if (!cfg.RESTAPIEnabled) throw new Error("REST API non configurée");
    return new PalworldApiClient(
      Number(cfg.RESTAPIPort ?? 8212),
      String(cfg.AdminPassword ?? ""),
    );
  };

  ipcMain.handle("palapi:getInfo", () => getClient().getInfo());
  ipcMain.handle("palapi:getPlayers", () => getClient().getPlayers());
  ipcMain.handle("palapi:getMetrics", () => getClient().getMetrics());
  ipcMain.handle("palapi:announce", (_, message: string) =>
    getClient().announce(message),
  );
  ipcMain.handle("palapi:kick", (_, userid: string, message?: string) =>
    getClient().kick(userid, message),
  );
  ipcMain.handle("palapi:ban", (_, userid: string, message?: string) =>
    getClient().ban(userid, message),
  );
  ipcMain.handle("palapi:unban", (_, userid: string) =>
    getClient().unban(userid),
  );
  ipcMain.handle("palapi:shutdown", (_, waittime: number, message?: string) =>
    getClient().shutdown(waittime, message),
  );
}
