import { ipcMain } from "electron/main";
import type { Server } from "../../../shared/types";
import type { IpcContext } from "../context";
import type { ServerRegistry } from "../../servers/ServerRegistry";

export function registerServersHandlers(
  ctx: IpcContext,
  registry: ServerRegistry,
): void {
  ipcMain.handle("servers:list", () => registry.list());
  ipcMain.handle("servers:getActive", () => registry.getActive());
  ipcMain.handle("servers:setActive", (_, id: string | null) => {
    registry.setActive(id);
  });
  ipcMain.handle(
    "servers:create",
    (
      _,
      input: {
        name: string;
        path: string;
        gameType?: Server["gameType"];
        color?: string | null;
      },
    ) => registry.create(input),
  );
  ipcMain.handle(
    "servers:update",
    (_, id: string, patch: Partial<Omit<Server, "id" | "createdAt">>) =>
      registry.update(id, patch),
  );
  ipcMain.handle("servers:delete", (_, id: string) => {
    registry.delete(id);
  });
  // Garde-fou pour empêcher le linter de râler sur ctx non utilisé : on
  // pourra s'en servir si on doit broadcaster un changement de serveur actif.
  void ctx;
}
