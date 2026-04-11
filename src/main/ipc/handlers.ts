import { ipcMain, BrowserWindow, app } from 'electron/main'
import { ServerManager } from '../server/ServerManager'
import { SteamCMD } from '../steamcmd/SteamCMD'
import { PalConfigParser } from '../config/PalConfigParser'
import { SystemMonitor } from '../monitor/SystemMonitor'
import { FirewallManager } from '../firewall/FirewallManager'
import Store from 'electron-store'

export function registerIpcHandlers(): void {
  const store = new Store<{
    serverPath: string
    serverArgs: string[]
    autoRestart: boolean
  }>()

  const serverManager = new ServerManager()
  const steamcmd = new SteamCMD()
  const configParser = new PalConfigParser()
  const systemMonitor = new SystemMonitor()
  const firewall = new FirewallManager()
  // --- Window controls ---
  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })
  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })
  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  // --- App config (persisted) ---
  ipcMain.handle('config:getServerPath', () => store.get('serverPath', ''))
  ipcMain.handle('config:setServerPath', (_, path: string) => store.set('serverPath', path))

  // --- SteamCMD / Installation ---
  ipcMain.handle('steamcmd:isInstalled', () => steamcmd.isInstalled())
  ipcMain.handle('steamcmd:install', async (event) => {
    return steamcmd.install((progress) => {
      event.sender.send('steamcmd:progress', progress)
    })
  })
  ipcMain.handle('steamcmd:installPalworld', async (event, installPath: string) => {
    store.set('serverPath', installPath)
    return steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send('steamcmd:progress', progress)
    })
  })
  ipcMain.handle('steamcmd:updatePalworld', async (event) => {
    const installPath = store.get('serverPath', '')
    return steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send('steamcmd:progress', progress)
    })
  })

  // --- Server controls ---
  ipcMain.handle('server:start', async (event) => {
    const serverPath = store.get('serverPath', '')
    const args = store.get('serverArgs', [])
    return serverManager.start(serverPath, args, (line) => {
      event.sender.send('server:log', line)
    })
  })
  ipcMain.handle('server:stop', () => serverManager.stop())
  ipcMain.handle('server:restart', async (event) => {
    const serverPath = store.get('serverPath', '')
    const args = store.get('serverArgs', [])
    return serverManager.restart(serverPath, args, (line) => {
      event.sender.send('server:log', line)
    })
  })
  ipcMain.handle('server:status', () => serverManager.getStatus())

  // --- Palworld config (.ini) ---
  ipcMain.handle('palconfig:read', async () => {
    const serverPath = store.get('serverPath', '')
    return configParser.read(serverPath)
  })
  ipcMain.handle('palconfig:write', async (_, settings: Record<string, string | number | boolean>) => {
    const serverPath = store.get('serverPath', '')
    return configParser.write(serverPath, settings)
  })

  // --- System monitoring ---
  ipcMain.handle('monitor:getStats', () => systemMonitor.getStats())
  ipcMain.handle('monitor:startPolling', (event) => {
    systemMonitor.startPolling(2000, (stats) => {
      event.sender.send('monitor:stats', stats)
    })
  })
  ipcMain.handle('monitor:stopPolling', () => systemMonitor.stopPolling())

  // --- Dialog (folder picker) ---
  ipcMain.handle('dialog:selectFolder', async () => {
    const { dialog } = await import('electron/main')
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })

  // --- Firewall ---
  ipcMain.handle('firewall:isAdmin', () => firewall.isAdmin())
  ipcMain.handle('firewall:getStatus', (_, gamePort: number, rconPort: number, restApiPort: number) =>
    firewall.getStatus(gamePort, rconPort, restApiPort)
  )
  ipcMain.handle('firewall:enableRule', (_, key: 'game' | 'rcon' | 'restapi', port: number, protocol: 'TCP' | 'UDP') =>
    firewall.enableRule(key, port, protocol)
  )
  ipcMain.handle('firewall:disableRule', (_, key: 'game' | 'rcon' | 'restapi') =>
    firewall.disableRule(key)
  )
  ipcMain.handle('firewall:applyAll', (_, gamePort: number, rconPort: number, restApiPort: number) =>
    firewall.applyAll(gamePort, rconPort, restApiPort)
  )
  ipcMain.handle('firewall:removeAll', () => firewall.removeAll())
  ipcMain.handle('firewall:listCustomRules', () => firewall.listCustomRules())
  ipcMain.handle('firewall:createCustomRule', (_, name: string, port: number, protocol: 'TCP' | 'UDP') =>
    firewall.createCustomRule(name, port, protocol)
  )
  ipcMain.handle('firewall:deleteCustomRule', (_, name: string, protocol: 'TCP' | 'UDP') =>
    firewall.deleteCustomRule(name, protocol)
  )

  // --- App info ---
  ipcMain.handle('app:getVersion', () => app.getVersion())
}
