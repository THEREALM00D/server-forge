import { ipcMain } from "electron/main";
import { app } from "electron/main";
import { join } from "path";
import { shell } from "electron";
import type { IpcContext } from "../../../ipc/context";
import type { ValheimLaunchConfig } from "../../../../shared/types";

export function registerValheimHandlers(ctx: IpcContext): void {
  ipcMain.handle("valheim:getConfig", (_, serverId?: string) =>
    ctx.getValheimConfig(serverId),
  );

  ipcMain.handle(
    "valheim:setConfig",
    (_, cfg: Partial<ValheimLaunchConfig>, serverId?: string) => {
      ctx.updateValheimConfig(serverId, cfg);
    },
  );

  // Ouvre le dossier de sauvegardes Valheim : chemin custom si défini, sinon
  // le dossier par défaut (%APPDATA%\Roaming\Valheim\worlds).
  ipcMain.handle("valheim:openSaveFolder", (_, customSavedir: string) => {
    const target =
      customSavedir || join(app.getPath("appData"), "Valheim", "worlds");
    return shell.openPath(target);
  });
}
