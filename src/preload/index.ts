import { contextBridge, ipcRenderer } from "electron";

const api = {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
  },
  // App config
  config: {
    getServerPath: () => ipcRenderer.invoke("config:getServerPath"),
    setServerPath: (path: string) =>
      ipcRenderer.invoke("config:setServerPath", path),
  },
  // SteamCMD
  steamcmd: {
    isInstalled: () => ipcRenderer.invoke("steamcmd:isInstalled"),
    install: () => ipcRenderer.invoke("steamcmd:install"),
    installPalworld: (path: string) =>
      ipcRenderer.invoke("steamcmd:installPalworld", path),
    updatePalworld: () => ipcRenderer.invoke("steamcmd:updatePalworld"),
    checkForUpdate: () => ipcRenderer.invoke("steamcmd:checkForUpdate"),
    onProgress: (cb: (msg: string) => void) => {
      ipcRenderer.on("steamcmd:progress", (_e, msg) => cb(msg));
      return () => ipcRenderer.removeAllListeners("steamcmd:progress");
    },
  },
  // Server
  server: {
    start: () => ipcRenderer.invoke("server:start"),
    stop: () => ipcRenderer.invoke("server:stop"),
    restart: () => ipcRenderer.invoke("server:restart"),
    getStatus: () => ipcRenderer.invoke("server:status"),
    onLog: (cb: (line: string) => void) => {
      ipcRenderer.on("server:log", (_e, line) => cb(line));
      return () => ipcRenderer.removeAllListeners("server:log");
    },
  },
  // Palworld config
  palconfig: {
    read: () => ipcRenderer.invoke("palconfig:read"),
    write: (settings: Record<string, unknown>) =>
      ipcRenderer.invoke("palconfig:write", settings),
  },
  // Monitor
  monitor: {
    getStats: () => ipcRenderer.invoke("monitor:getStats"),
    startPolling: () => ipcRenderer.invoke("monitor:startPolling"),
    stopPolling: () => ipcRenderer.invoke("monitor:stopPolling"),
    onStats: (cb: (stats: unknown) => void) => {
      ipcRenderer.on("monitor:stats", (_e, stats) => cb(stats));
      return () => ipcRenderer.removeAllListeners("monitor:stats");
    },
  },
  // Firewall
  firewall: {
    isAdmin: () => ipcRenderer.invoke("firewall:isAdmin"),
    getStatus: (gamePort: number, rconPort: number, restApiPort: number) =>
      ipcRenderer.invoke("firewall:getStatus", gamePort, rconPort, restApiPort),
    enableRule: (
      key: "game" | "rcon" | "restapi",
      port: number,
      protocol: "TCP" | "UDP",
    ) => ipcRenderer.invoke("firewall:enableRule", key, port, protocol),
    disableRule: (key: "game" | "rcon" | "restapi") =>
      ipcRenderer.invoke("firewall:disableRule", key),
    applyAll: (gamePort: number, rconPort: number, restApiPort: number) =>
      ipcRenderer.invoke("firewall:applyAll", gamePort, rconPort, restApiPort),
    removeAll: () => ipcRenderer.invoke("firewall:removeAll"),
    listCustomRules: () => ipcRenderer.invoke("firewall:listCustomRules"),
    createCustomRule: (name: string, port: number, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:createCustomRule", name, port, protocol),
    deleteCustomRule: (name: string, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:deleteCustomRule", name, protocol),
  },
  // Palworld REST API
  palapi: {
    getInfo: () => ipcRenderer.invoke("palapi:getInfo"),
    getPlayers: () => ipcRenderer.invoke("palapi:getPlayers"),
    getMetrics: () => ipcRenderer.invoke("palapi:getMetrics"),
    announce: (message: string) =>
      ipcRenderer.invoke("palapi:announce", message),
    kick: (userid: string, message?: string) =>
      ipcRenderer.invoke("palapi:kick", userid, message),
    ban: (userid: string, message?: string) =>
      ipcRenderer.invoke("palapi:ban", userid, message),
    unban: (userid: string) => ipcRenderer.invoke("palapi:unban", userid),
    shutdown: (waittime: number, message?: string) =>
      ipcRenderer.invoke("palapi:shutdown", waittime, message),
  },
  // Dialog
  dialog: {
    selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  },
  // App
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.api = api;
}
