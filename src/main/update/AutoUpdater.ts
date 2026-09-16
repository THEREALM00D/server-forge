import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain, app } from "electron/main";
import type { AppUpdateStatus } from "../../shared/types";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// Toutes nos releases sont marquées "pre-release" pendant l'alpha — sans ça,
// electron-updater les ignore par défaut (comme l'API "latest" de GitHub).
autoUpdater.allowPrerelease = true;
// Fixé explicitement (plutôt que dérivé du suffixe de currentVersion) pour
// ne pas dépendre du format exact de la version qui tourne. Doit matcher
// `publish.channel` dans electron-builder.yml (génère "alpha.yml"), et les
// tags de version doivent utiliser le format pointé "X.Y.Z-alpha.N" — sans
// le point, semver traite "alphaN" comme un identifiant unique par build et
// electron-updater ne peut jamais faire le lien entre deux versions alpha.
autoUpdater.channel = "alpha";

function broadcast(status: AppUpdateStatus): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("update:status", status);
  }
}

/**
 * Branche electron-updater sur les releases GitHub (déjà publiées par
 * electron-builder via `publish: provider: github` dans electron-builder.yml
 * — le `alpha.yml` nécessaire est généré automatiquement à chaque build).
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
    // Le tag/la release GitHub existe mais alpha.yml (et le fallback
    // latest.yml) ne sont pas encore uploadés — le workflow de release est
    // probablement encore en train de build. Pas une vraie erreur pour
    // l'utilisateur, juste "réessaie plus tard" (le prochain check au
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
