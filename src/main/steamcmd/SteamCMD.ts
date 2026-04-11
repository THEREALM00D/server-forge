import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { spawn } from 'child_process'
import { app } from 'electron/main'
import https from 'https'
import fs from 'fs'

const PALWORLD_APP_ID = '2394010'
const STEAMCMD_URL = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip'

export class SteamCMD {
  private get steamcmdDir(): string {
    return join(app.getPath('userData'), 'steamcmd')
  }

  private get exe(): string {
    return join(this.steamcmdDir, 'steamcmd.exe')
  }

  isInstalled(): boolean {
    return existsSync(this.exe)
  }

  async install(onProgress: (msg: string) => void): Promise<{ success: boolean; error?: string }> {
    if (this.isInstalled()) {
      onProgress('SteamCMD already installed.')
      return { success: true }
    }

    mkdirSync(this.steamcmdDir, { recursive: true })
    const zipPath = join(this.steamcmdDir, 'steamcmd.zip')

    onProgress('Downloading SteamCMD...')

    try {
      await this.downloadFile(STEAMCMD_URL, zipPath)
      onProgress('Extracting SteamCMD...')
      await this.extractZip(zipPath, this.steamcmdDir)
      onProgress('SteamCMD installed successfully.')
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  async installPalworld(
    installPath: string,
    onProgress: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isInstalled()) {
      const result = await this.install(onProgress)
      if (!result.success) return result
    }

    mkdirSync(installPath, { recursive: true })
    onProgress(`Installing Palworld server to: ${installPath}`)

    return new Promise((resolve) => {
      const args = [
        '+force_install_dir', installPath,
        '+login', 'anonymous',
        '+app_update', PALWORLD_APP_ID, 'validate',
        '+quit'
      ]

      const proc = spawn(this.exe, args, { cwd: this.steamcmdDir })

      proc.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onProgress(line.trim()))
      })

      proc.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line) => onProgress(`[ERR] ${line.trim()}`))
      })

      proc.on('close', (code) => {
        if (code === 0) {
          onProgress('Palworld server installed/updated successfully!')
          resolve({ success: true })
        } else {
          resolve({ success: false, error: `SteamCMD exited with code ${code}` })
        }
      })

      proc.on('error', (err) => resolve({ success: false, error: err.message }))
    })
  }

  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest)
      https.get(url, (res) => {
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve()))
      }).on('error', (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
    })
  }

  private extractZip(zipPath: string, destDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', [
        '-Command',
        `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`
      ])
      proc.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Extraction failed with code ${code}`))
      })
      proc.on('error', reject)
    })
  }
}
