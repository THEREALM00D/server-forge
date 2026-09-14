import { app, BrowserWindow, session } from "electron/main";
import { shell } from "electron";
import { join } from "path";
import { registerIpcHandlers } from "./ipc/handlers";
import { checkForUpdateOnStartup } from "./update/AutoUpdater";

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
    checkForUpdateOnStartup();
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

app.whenReady().then(async () => {
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

  await registerIpcHandlers();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
