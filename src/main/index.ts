import { app, BrowserWindow, session } from "electron/main";
import { shell } from "electron";
import { join, resolve } from "path";
import { registerIpcHandlers } from "./ipc/handlers";

// En dev sur Windows, setAsDefaultProtocolClient doit recevoir le chemin du
// script entry point pour enregistrer notre app et non electron.exe directement.
if (!app.isPackaged) {
  app.setAsDefaultProtocolClient("nxm", process.execPath, [
    resolve(process.argv[1]),
  ]);
} else {
  app.setAsDefaultProtocolClient("nxm");
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false, // requis par electron-vite (preload bundlé en CJS)
      contextIsolation: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    if (!app.isPackaged)
      mainWindow.webContents.openDevTools({ mode: "detach" });
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Événement second-instance : l'app est déjà ouverte, Windows relance avec nxm://
app.on("second-instance", (_, argv) => {
  const nxmUrl = argv.find((a) => a.startsWith("nxm://"));
  if (nxmUrl) {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      win.webContents.send("nxm:install", nxmUrl);
    }
  }
});

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.palworld.manager");
  }

  // CSP en production uniquement (dev : Vite HMR utilise eval)
  if (app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://gcdn.thunderstore.io; font-src 'self' data:",
          ],
        },
      });
    });
  }

  registerIpcHandlers();
  createWindow();

  // Premier lancement avec nxm:// (app pas encore ouverte, args de la commande)
  const nxmUrl = process.argv.find((a) => a.startsWith("nxm://"));
  if (nxmUrl) {
    app.once("browser-window-created", (_, win) => {
      win.webContents.once("did-finish-load", () => {
        win.webContents.send("nxm:install", nxmUrl);
      });
    });
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
