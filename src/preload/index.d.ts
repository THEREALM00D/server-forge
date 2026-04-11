interface SystemStats {
  cpu: number
  ram: number
  ramUsed: number
  ramTotal: number
  uptime: number
}

interface API {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
  }
  config: {
    getServerPath: () => Promise<string>
    setServerPath: (path: string) => Promise<void>
  }
  steamcmd: {
    isInstalled: () => Promise<boolean>
    install: () => Promise<{ success: boolean; error?: string }>
    installPalworld: (path: string) => Promise<{ success: boolean; error?: string }>
    updatePalworld: () => Promise<{ success: boolean; error?: string }>
    onProgress: (cb: (msg: string) => void) => () => void
  }
  server: {
    start: () => Promise<{ success: boolean; error?: string }>
    stop: () => Promise<{ success: boolean; error?: string }>
    restart: () => Promise<{ success: boolean; error?: string }>
    getStatus: () => Promise<string>
    onLog: (cb: (line: string) => void) => () => void
  }
  palconfig: {
    read: () => Promise<Record<string, string | number | boolean>>
    write: (settings: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }
  monitor: {
    getStats: () => Promise<SystemStats>
    startPolling: () => Promise<void>
    stopPolling: () => Promise<void>
    onStats: (cb: (stats: SystemStats) => void) => () => void
  }
  firewall: {
    isAdmin: () => Promise<boolean>
    getStatus: (gamePort: number, rconPort: number, restApiPort: number) => Promise<Array<{
      name: string; port: number; protocol: 'TCP' | 'UDP'; active: boolean
    }>>
    enableRule: (key: 'game' | 'rcon' | 'restapi', port: number, protocol: 'TCP' | 'UDP') => Promise<{ success: boolean; error?: string }>
    disableRule: (key: 'game' | 'rcon' | 'restapi') => Promise<{ success: boolean; error?: string }>
    applyAll: (gamePort: number, rconPort: number, restApiPort: number) => Promise<{ success: boolean; errors: string[] }>
    removeAll: () => Promise<void>
    listCustomRules: () => Promise<Array<{ name: string; port: number; protocol: 'TCP' | 'UDP'; active: boolean }>>
    createCustomRule: (name: string, port: number, protocol: 'TCP' | 'UDP') => Promise<{ success: boolean; error?: string }>
    deleteCustomRule: (name: string, protocol: 'TCP' | 'UDP') => Promise<{ success: boolean; error?: string }>
  }
  dialog: {
    selectFolder: () => Promise<string | null>
  }
  app: {
    getVersion: () => Promise<string>
  }
}

interface Window {
  api: API
}
