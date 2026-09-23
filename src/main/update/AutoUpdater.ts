import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain, app } from "electron/main";
import type { AppUpdateStatus } from "../../shared/types";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// Versions semver stables (0.x.y, sans suffixe -alpha/-beta) depuis le
// passage à release-please : canal par défaut ("latest.yml" via l'API
// "latest release" de GitHub), donc ni `allowPrerelease` ni `channel` à fixer.
// Les installs encore en 0.0.1-alpha.N (canal "alpha") retrouvent quand même
// ces versions : electron-updater y cherche "alpha.yml" puis retombe sur
// "latest.yml" (fallback actif avec leur `allowPrerelease = true`).

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
  autoUpdater.on("error", (err) => {
    // Le tag/la release GitHub existe mais latest.yml n'est pas (encore)
    // uploadé — normalement impossible depuis que la release reste en draft
    // jusqu'à la fin du build (voir release.yml), gardé par sécurité. Pas
    // une vraie erreur pour l'utilisateur, juste "réessaie plus tard" (le prochain check au
    // démarrage retombera sur "idle" une fois les assets en ligne).
    const code = (err as NodeJS.ErrnoException).code;
    if (
      code === "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND" ||
      code === "ERR_UPDATER_NO_PUBLISHED_VERSIONS"
    ) {
      broadcast({ state: "unavailable" });
      return;
    }
    broadcast({ state: "error", message: err.message });
  });

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
