import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import log from "electron-log";
import { BrowserWindow, app, ipcMain } from "electron/main";
import type { UpdaterState } from "../../shared/types";

export class AppUpdater {
  private state: UpdaterState;

  constructor() {
    this.state = {
      status: "idle",
      version: null,
      progress: 0,
      message: null,
      currentVersion: app.getVersion(),
    };

    autoUpdater.logger = log;
    log.transports.file.level = "info";
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("checking-for-update", () => {
      this.update({ status: "checking", message: null });
    });

    autoUpdater.on("update-available", (info: UpdateInfo) => {
      this.update({
        status: "available",
        version: info.version,
        message: null,
      });
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      this.update({
        status: "not-available",
        version: info.version,
        message: null,
      });
    });

    autoUpdater.on("download-progress", (p: ProgressInfo) => {
      this.update({
        status: "downloading",
        progress: Math.round(p.percent),
      });
    });

    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      this.update({
        status: "ready",
        version: info.version,
        progress: 100,
      });
    });

    autoUpdater.on("error", (err: Error) => {
      // Erreurs « attendues » qu'on n'expose pas à l'utilisateur final :
      // - 404 : aucune release publiée (ou repo inexistant)
      // - erreurs réseau classiques (offline, DNS, etc.)
      const msg = err.message ?? "";
      const silent =
        /\b404\b/.test(msg) ||
        /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET|EAI_AGAIN/.test(msg) ||
        /net::ERR_/.test(msg);
      if (silent) {
        log.warn("[Updater] silent error:", msg);
        this.update({ status: "idle", message: null });
        return;
      }
      this.update({ status: "error", message: err.message });
    });
  }

  private update(patch: Partial<UpdaterState>): void {
    this.state = { ...this.state, ...patch };
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("updater:state", this.state),
    );
  }

  registerIpc(): void {
    ipcMain.handle("updater:getState", () => this.state);
    ipcMain.handle("updater:check", async () => {
      try {
        await autoUpdater.checkForUpdates();
      } catch (e) {
        this.update({ status: "error", message: (e as Error).message });
      }
    });
    ipcMain.handle("updater:download", async () => {
      try {
        await autoUpdater.downloadUpdate();
      } catch (e) {
        this.update({ status: "error", message: (e as Error).message });
      }
    });
    ipcMain.handle("updater:install", () => {
      autoUpdater.quitAndInstall(false, true);
    });
  }

  // Vérification silencieuse au démarrage : ne télécharge pas tout seul,
  // notifie juste l'UI si une version est dispo.
  checkOnStartup(): void {
    if (!app.isPackaged) {
      log.info("[Updater] App non packagée, skip check.");
      return;
    }
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("[Updater] check failed:", err);
    });
  }
}
