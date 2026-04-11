import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Paper, Button, TextField, Stack, Chip, Divider } from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DownloadIcon from '@mui/icons-material/Download'
import UpdateIcon from '@mui/icons-material/Update'
import { useServer } from '../context/ServerContext'
import { steamService } from '../services/steamService'
import { dialogService } from '../services/dialogService'

export default function Install() {
  const { state, dispatch } = useServer()
  const [steamInstalled, setSteamInstalled] = useState<boolean | null>(null)
  const [installPath, setInstallPath] = useState(state.serverPath || 'C:\\PalworldServer')
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    steamService.isInstalled().then(setSteamInstalled)
    if (state.serverPath) setInstallPath(state.serverPath)
  }, [state.serverPath])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    const unsub = steamService.onProgress((msg) => setLogs((p) => [...p, msg]))
    return unsub
  }, [])

  const addLog = (msg: string) => setLogs((p) => [...p, msg])

  const handleBrowse = async () => {
    const folder = await dialogService.selectFolder()
    if (folder) setInstallPath(folder)
  }

  const handleInstallSteam = async () => {
    setRunning(true); setLogs([])
    const res = await steamService.install()
    setSteamInstalled(res.success)
    if (!res.success) addLog(`Erreur: ${res.error}`)
    setRunning(false)
  }

  const handleInstallPalworld = async () => {
    if (!installPath) return
    setRunning(true); setLogs([])
    const res = await steamService.installPalworld(installPath)
    if (res.success) dispatch({ type: 'SET_SERVER_PATH', payload: installPath })
    else addLog(`Erreur: ${res.error}`)
    setRunning(false)
  }

  const handleUpdate = async () => {
    setRunning(true); setLogs([])
    const res = await steamService.updatePalworld()
    if (!res.success) addLog(`Erreur: ${res.error}`)
    setRunning(false)
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h6">Installation</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Installer ou mettre à jour le serveur Palworld via SteamCMD
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2">SteamCMD</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {steamInstalled === null ? 'Vérification...' : steamInstalled ? 'Installé' : 'Non installé'}
            </Typography>
          </Box>
          <Chip
            label={steamInstalled ? 'OK' : steamInstalled === null ? '...' : 'Manquant'}
            color={steamInstalled ? 'success' : 'default'}
            size="small"
          />
        </Stack>
        {!steamInstalled && (
          <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} disabled={running} onClick={handleInstallSteam}>
            Installer SteamCMD
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Dossier d'installation</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth size="small" value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            placeholder="C:\PalworldServer"
          />
          <Button variant="outlined" onClick={handleBrowse} startIcon={<FolderOpenIcon />} sx={{ whiteSpace: 'nowrap' }}>
            Parcourir
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained" color="success" startIcon={<DownloadIcon />}
            disabled={running || !steamInstalled} onClick={handleInstallPalworld}>
            {running ? 'Installation...' : 'Installer Palworld'}
          </Button>
          <Button fullWidth variant="outlined" startIcon={<UpdateIcon />}
            disabled={running || !steamInstalled || !state.serverPath} onClick={handleUpdate}>
            Mettre à jour
          </Button>
        </Stack>
      </Paper>

      {logs.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Progression
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ height: 180, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', lineHeight: 1.6 }}>
            {logs.map((line, i) => <div key={i}>{line}</div>)}
            <div ref={logsEndRef} />
          </Box>
        </Paper>
      )}
    </Stack>
  )
}
