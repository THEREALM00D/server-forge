import { spawn, ChildProcess, exec } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import { PalworldApiClient } from './PalworldApiClient'

export interface StopConfig {
  restApiEnabled?: boolean
  restApiPort?: number
  adminPassword?: string
  shutdownWaittime?: number
  shutdownMessage?: string
}

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed'

export class ServerManager {
  private process: ChildProcess | null = null
  private status: ServerStatus = 'stopped'
  private autoRestart = false
  private restartCount = 0
  private readonly maxRestarts = 5
  private onLog: (line: string) => void = () => {}

  async start(
    serverPath: string,
    args: string[],
    onLog: (line: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (this.status === 'running' || this.status === 'starting') {
      return { success: false, error: 'Server is already running' }
    }

    const exe = join(serverPath, 'PalServer.exe')
    if (!existsSync(exe)) {
      return { success: false, error: `PalServer.exe not found at: ${exe}` }
    }

    this.onLog = onLog
    this.status = 'starting'
    onLog('[Manager] Starting Palworld server...')

    try {
      this.process = spawn(exe, args, {
        cwd: serverPath,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      this.process.on('spawn', () => {
        if (this.status === 'starting') this.status = 'running'
        onLog('[Manager] Processus démarré.')
      })

      this.process.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onLog(line))
      })

      this.process.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onLog(`[ERR] ${line}`))
      })

      this.process.on('close', (code) => {
        const wasRunning = this.status === 'running'
        // Si on était en train d'arrêter volontairement, on passe à 'stopped' quel que soit le code
        this.status = this.status === 'stopping' ? 'stopped' : (code === 0 ? 'stopped' : 'crashed')
        this.process = null
        onLog(`[Manager] Server exited with code ${code}`)

        if (wasRunning && this.autoRestart && this.restartCount < this.maxRestarts) {
          this.restartCount++
          onLog(`[Manager] Auto-restarting... (attempt ${this.restartCount}/${this.maxRestarts})`)
          setTimeout(() => this.start(serverPath, args, onLog), 5000)
        }
      })

      this.process.on('error', (err) => {
        this.status = 'crashed'
        this.process = null
        onLog(`[Manager] Process error: ${err.message}`)
      })

      return { success: true }
    } catch (err) {
      this.status = 'crashed'
      return { success: false, error: String(err) }
    }
  }

  private async stopViaApi(client: PalworldApiClient, waittime: number, message: string): Promise<boolean> {
    try {
      if (message) {
        await client.announce(message)
        this.onLog(`[Manager] Annonce envoyée: ${message}`)
      }
      this.onLog('[Manager] Sauvegarde en cours...')
      await client.save()
      this.onLog('[Manager] Sauvegarde terminée.')
      await client.shutdown(waittime, '')
      this.onLog(`[Manager] Shutdown API envoyé (attente ${waittime}s).`)
      return true
    } catch (err) {
      this.onLog(`[Manager] API indisponible: ${(err as Error).message}`)
      return false
    }
  }

  private forceKill(pid: number): void {
    if (process.platform === 'win32') {
      exec(`taskkill /F /T /PID ${pid}`, (err) => {
        if (err) try { this.process?.kill('SIGKILL') } catch {}
      })
    } else {
      try { this.process?.kill('SIGKILL') } catch {}
    }
  }

  async stop(cfg?: StopConfig): Promise<{ success: boolean; error?: string }> {
    if (!this.process || this.status === 'stopped') {
      return { success: false, error: 'Server is not running' }
    }

    this.autoRestart = false
    this.status = 'stopping'

    const pid = this.process.pid

    if (cfg?.restApiEnabled && cfg.restApiPort && cfg.adminPassword) {
      const client = new PalworldApiClient(cfg.restApiPort, cfg.adminPassword)
      const waittime = cfg.shutdownWaittime ?? 0
      const message = cfg.shutdownMessage ?? ''
      const apiOk = await this.stopViaApi(client, waittime, message)

      if (apiOk && waittime > 0) {
        // Wait for the server to shut itself down gracefully
        this.onLog(`[Manager] Attente arrêt gracieux (${waittime}s)...`)
        await new Promise<void>((resolve) => {
          let done = false
          const finish = () => { if (!done) { done = true; resolve() } }
          this.process!.once('close', finish)
          setTimeout(finish, (waittime + 10) * 1000)
        })
        return { success: true }
      }

      if (!apiOk && pid) {
        this.onLog('[Manager] Arrêt forcé via taskkill...')
        return new Promise((resolve) => {
          let done = false
          const finish = () => { if (!done) { done = true; resolve({ success: true }) } }
          this.process!.once('close', finish)
          setTimeout(finish, 6000)
          this.forceKill(pid)
        })
      }
    }

    this.onLog('[Manager] Arrêt du serveur...')
    return new Promise((resolve) => {
      let done = false
      const finish = () => { if (!done) { done = true; resolve({ success: true }) } }
      this.process!.once('close', finish)
      setTimeout(finish, 6000)
      if (pid) this.forceKill(pid)
    })
  }

  async restart(
    serverPath: string,
    args: string[],
    onLog: (line: string) => void,
    cfg?: StopConfig
  ): Promise<{ success: boolean; error?: string }> {
    if (this.process) {
      await this.stop(cfg)
      await new Promise((r) => setTimeout(r, 1500))
    }
    this.restartCount = 0
    return this.start(serverPath, args, onLog)
  }

  getStatus(): ServerStatus {
    return this.status
  }

  setAutoRestart(enabled: boolean): void {
    this.autoRestart = enabled
    this.restartCount = 0
  }
}
