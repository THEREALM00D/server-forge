import { spawn, ChildProcess, exec } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed'

export class ServerManager {
  private process: ChildProcess | null = null
  private status: ServerStatus = 'stopped'
  private autoRestart = false
  private restartCount = 0
  private readonly maxRestarts = 5

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

    this.status = 'starting'
    onLog('[Manager] Starting Palworld server...')

    try {
      this.process = spawn(exe, args, {
        cwd: serverPath,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      this.process.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onLog(line))
        if (this.status === 'starting') this.status = 'running'
      })

      this.process.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onLog(`[ERR] ${line}`))
      })

      this.process.on('close', (code) => {
        const wasRunning = this.status === 'running'
        this.status = code === 0 ? 'stopped' : 'crashed'
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

  async stop(): Promise<{ success: boolean; error?: string }> {
    if (!this.process || this.status === 'stopped') {
      return { success: false, error: 'Server is not running' }
    }

    this.autoRestart = false
    this.status = 'stopping'
    const pid = this.process.pid

    return new Promise((resolve) => {
      let done = false
      const finish = () => {
        if (!done) { done = true; resolve({ success: true }) }
      }

      this.process!.once('close', finish)
      setTimeout(finish, 6000)

      if (process.platform === 'win32' && pid) {
        exec(`taskkill /F /T /PID ${pid}`, (err) => {
          if (err) try { this.process?.kill('SIGKILL') } catch {}
        })
      } else {
        try { this.process!.kill('SIGKILL') } catch {}
      }
    })
  }

  async restart(
    serverPath: string,
    args: string[],
    onLog: (line: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (this.process) {
      await this.stop()
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
