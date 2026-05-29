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
  // Multi-serveur
  servers: {
    list: () => ipcRenderer.invoke("servers:list"),
    getActive: () => ipcRenderer.invoke("servers:getActive"),
    setActive: (id: string | null) =>
      ipcRenderer.invoke("servers:setActive", id),
    create: (input: {
      name: string;
      path: string;
      gameType?: "palworld" | "valheim";
      color?: string | null;
    }) => ipcRenderer.invoke("servers:create", input),
    update: (
      id: string,
      patch: Partial<{
        name: string;
        path: string;
        gameType: "palworld" | "valheim";
        color: string | null;
      }>,
    ) => ipcRenderer.invoke("servers:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("servers:delete", id),
  },
  // SteamCMD
  steamcmd: {
    isInstalled: () => ipcRenderer.invoke("steamcmd:isInstalled"),
    install: () => ipcRenderer.invoke("steamcmd:install"),
    installPalworld: (path: string) =>
      ipcRenderer.invoke("steamcmd:installPalworld", path),
    updatePalworld: () => ipcRenderer.invoke("steamcmd:updatePalworld"),
    installValheim: (path: string) =>
      ipcRenderer.invoke("steamcmd:installValheim", path),
    updateValheim: () => ipcRenderer.invoke("steamcmd:updateValheim"),
    checkForUpdate: () => ipcRenderer.invoke("steamcmd:checkForUpdate"),
    onProgress: (cb: (msg: string) => void) => {
      ipcRenderer.on("steamcmd:progress", (_e, msg) => cb(msg));
      return () => ipcRenderer.removeAllListeners("steamcmd:progress");
    },
  },
  // Server (tous les handlers acceptent un serverId optionnel — par défaut actif)
  server: {
    start: (serverId?: string) => ipcRenderer.invoke("server:start", serverId),
    stop: (serverId?: string) => ipcRenderer.invoke("server:stop", serverId),
    restart: (serverId?: string) =>
      ipcRenderer.invoke("server:restart", serverId),
    getStatus: () => ipcRenderer.invoke("server:status"),
    getStatuses: () => ipcRenderer.invoke("server:statuses"),
    getLaunchArgs: (serverId?: string) =>
      ipcRenderer.invoke("server:getLaunchArgs", serverId),
    setLaunchArgs: (
      cfg: {
        publicLobby: boolean;
        performanceFlags: boolean;
        customArgs: string;
      },
      serverId?: string,
    ) => ipcRenderer.invoke("server:setLaunchArgs", cfg, serverId),
    onLog: (cb: (event: { serverId: string; line: string }) => void) => {
      ipcRenderer.on("server:log", (_e, event) => cb(event));
      return () => ipcRenderer.removeAllListeners("server:log");
    },
  },
  // Palworld config (serverId optionnel — par défaut actif)
  palconfig: {
    read: (serverId?: string) => ipcRenderer.invoke("palconfig:read", serverId),
    write: (settings: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("palconfig:write", settings, serverId),
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
    checkRule: (name: string) => ipcRenderer.invoke("firewall:checkRule", name),
    enableNamedRule: (name: string, port: number, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:enableNamedRule", name, port, protocol),
    disableNamedRule: (name: string, protocol?: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:disableNamedRule", name, protocol),
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
  // Player history
  players: {
    getHistory: () => ipcRenderer.invoke("players:getHistory"),
    clearHistory: () => ipcRenderer.invoke("players:clearHistory"),
    removeEntry: (userId: string) =>
      ipcRenderer.invoke("players:removeEntry", userId),
  },
  // Backups
  backup: {
    getConfig: () => ipcRenderer.invoke("backup:getConfig"),
    setConfig: (cfg: { backupDir: string; backupKeep: number }) =>
      ipcRenderer.invoke("backup:setConfig", cfg),
    list: () => ipcRenderer.invoke("backup:list"),
    create: () => ipcRenderer.invoke("backup:create"),
    restore: (backupPath: string) =>
      ipcRenderer.invoke("backup:restore", backupPath),
    delete: (backupPath: string) =>
      ipcRenderer.invoke("backup:delete", backupPath),
  },
  // Scheduler
  schedule: {
    getRestart: () => ipcRenderer.invoke("schedule:getRestart"),
    setRestart: (cfg: {
      enabled: boolean;
      time: string;
      warningMinutes: number;
      message: string;
    }) => ipcRenderer.invoke("schedule:setRestart", cfg),
  },
  // Shell
  shell: {
    openPath: (path: string) => ipcRenderer.invoke("shell:openPath", path),
  },
  // Dialog
  dialog: {
    selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  },
  // Valheim config (serverId optionnel — par défaut actif)
  valheim: {
    getConfig: (serverId?: string) =>
      ipcRenderer.invoke("valheim:getConfig", serverId),
    setConfig: (cfg: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("valheim:setConfig", cfg, serverId),
    openSaveFolder: (customSavedir: string) =>
      ipcRenderer.invoke("valheim:openSaveFolder", customSavedir),
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
