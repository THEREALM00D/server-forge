import { join } from 'path'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { spawn } from 'child_process'
import { app } from 'electron/main'
import fs from 'fs'

export interface UpdateCheckResult {
  upToDate: boolean
  installedBuild: string | null
  requiredBuild: string | null
}

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

  private getInstalledBuildId(installPath: string): string | null {
    // SteamCMD peut écrire le manifest dans installPath/steamapps/ ou dans son propre répertoire
    const candidates = [
      join(installPath, 'steamapps', `appmanifest_${PALWORLD_APP_ID}.acf`),
      join(this.steamcmdDir, 'steamapps', `appmanifest_${PALWORLD_APP_ID}.acf`),
    ]
    for (const acf of candidates) {
      if (!existsSync(acf)) continue
      const match = readFileSync(acf, 'utf-8').match(/"buildid"\s+"(\d+)"/)
      if (match) return match[1]
    }
    return null
  }

  checkForUpdate(installPath: string): Promise<UpdateCheckResult> {
    const installedBuild = this.getInstalledBuildId(installPath)
    if (!installedBuild || !this.isInstalled()) {
      return Promise.resolve({ upToDate: false, installedBuild, requiredBuild: null })
    }

    return new Promise((resolve) => {
      const fallback = { upToDate: false, installedBuild, requiredBuild: null }
      let settled = false
      const done = (result: UpdateCheckResult) => {
        if (!settled) { settled = true; resolve(result) }
      }

      const timer = setTimeout(() => done(fallback), 30000)
      let output = ''

      // app_info_update 1 force le rafraîchissement du cache Steam
      // app_info_print retourne les infos du depot en VDF (inclut le buildid de la branche public)
      const proc = spawn(this.exe, [
        '+login', 'anonymous',
        '+app_info_update', '1',
        '+app_info_print', PALWORLD_APP_ID,
        '+quit',
      ], { cwd: this.steamcmdDir })

      proc.stdout?.on('data', (d: Buffer) => { output += d.toString() })
      proc.stderr?.on('data', (d: Buffer) => { output += d.toString() })

      proc.on('close', () => {
        clearTimeout(timer)
        // Trouver le buildid dans la section "public" du VDF
        const match = output.match(/"public"\s*\{[^}]*?"buildid"\s+"(\d+)"/s)
        if (!match) { done(fallback); return }
        const latestBuild = match[1]
        done({
          upToDate: installedBuild === latestBuild,
          installedBuild,
          requiredBuild: installedBuild !== latestBuild ? latestBuild : null,
        })
      })

      proc.on('error', () => { clearTimeout(timer); done(fallback) })
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
