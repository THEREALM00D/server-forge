import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";

export function registerPlayersHandlers(ctx: IpcContext): void {
  // Renvoie l'historique du serveur actif. Si aucun serveur sélectionné,
  // retourne une liste vide plutôt que de lever (l'UI charge dès l'ouverture).
  ipcMain.handle(
    "players:getHistory",
    () => ctx.playerHistories.getActive()?.list() ?? [],
  );
  ipcMain.handle("players:clearHistory", () => {
    ctx.playerHistories.getActive()?.clear();
  });
  ipcMain.handle("players:removeEntry", (_, userId: string) => {
    ctx.playerHistories.getActive()?.remove(userId);
  });
}
