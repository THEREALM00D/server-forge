import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain, app } from "electron/main";
import type { AppUpdateStatus } from "../../shared/types";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// Toutes nos releases sont marquées "pre-release" pendant l'alpha — sans ça,
// electron-updater les ignore par défaut (comme l'API "latest" de GitHub).
autoUpdater.allowPrerelease = true;

function broadcast(status: AppUpdateStatus): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("update:status", status);
  }
}

/**
 * Branche electron-updater sur les releases GitHub (déjà publiées par
 * electron-builder via `publish: provider: github` dans electron-builder.yml
 * — le `latest.yml` nécessaire est généré automatiquement à chaque build).
 * Flow entièrement manuel côté utilisateur : on vérifie automatiquement au
 * démarrage, mais le téléchargement et l'installation restent des actions
 * explicites (pas d'auto-download/install silencieux).
 */
export function registerAutoUpdater(): void {
  autoUpdater.on("checking-for-update", () => broadcast({ state: "checking" }));
  autoUpdater.on("update-available", (info) =>
    broadcast({ state: "available", version: info.version }),
  );
  autoUpdater.on("update-not-available", () => broadcast({ state: "idle" }));
  autoUpdater.on("download-progress", (progress) =>
    broadcast({ state: "downloading", percent: Math.round(progress.percent) }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    broadcast({ state: "downloaded", version: info.version }),
  );
  autoUpdater.on("error", (err) =>
    broadcast({ state: "error", message: err.message }),
  );

  ipcMain.handle("update:getCurrentVersion", () => app.getVersion());
  ipcMain.handle("update:check", () => {
    // No-op en dev (pas de app-update.yml packagé, pas de releases à comparer).
    if (!app.isPackaged) return;
    autoUpdater.checkForUpdates().catch(() => {
      // les erreurs remontent déjà via l'événement "error" écouté plus haut
    });
  });
  ipcMain.handle("update:download", () => autoUpdater.downloadUpdate());
  ipcMain.handle("update:install", () => autoUpdater.quitAndInstall());
}

export function checkForUpdateOnStartup(): void {
  if (!app.isPackaged) return;
  autoUpdater.checkForUpdates().catch(() => {
    // best-effort — pas de connexion, rate-limit GitHub, etc.
  });
}
