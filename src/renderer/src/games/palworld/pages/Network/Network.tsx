import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Paper, Button, Stack, Chip, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Tooltip,
  TextField, Select, MenuItem, FormControl, InputLabel, Divider, IconButton,
} from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import SyncIcon from '@mui/icons-material/Sync'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useServer } from '../../../../context/ServerContext'
import { useNotification } from '../../../../context/NotificationContext'
import { firewallService } from '../../services/firewallService'
import { configService } from '../../services/configService'
import type { FirewallRuleStatus } from '../types'

const RULE_KEYS: Record<string, 'game' | 'rcon' | 'restapi'> = {
  'Palworld Server - Game': 'game',
  'Palworld Server - RCON': 'rcon',
  'Palworld Server - REST API': 'restapi',
}

export default function Network() {
  const { state } = useServer()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [rules, setRules] = useState<FirewallRuleStatus[]>([])
  const [customRules, setCustomRules] = useState<FirewallRuleStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const { notify } = useNotification()
  const [newName, setNewName] = useState('')
  const [newPort, setNewPort] = useState('')
  const [newProtocol, setNewProtocol] = useState<'TCP' | 'UDP'>('UDP')
  const [creating, setCreating] = useState(false)

  const getPorts = useCallback(async () => {
    if (!state.serverPath) return { gamePort: 8211, rconPort: 25575, restApiPort: 8212 }
    const cfg = await configService.readPalConfig()
    return {
      gamePort: Number(cfg.PublicPort ?? 8211),
      rconPort: Number(cfg.RCONPort ?? 25575),
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
    }
  }, [state.serverPath])

  const refresh = useCallback(async () => {
    setLoading(true)
    const [admin, { gamePort, rconPort, restApiPort }] = await Promise.all([
      firewallService.isAdmin(),
      getPorts(),
    ])
    setIsAdmin(admin)
    const [status, custom] = await Promise.all([
      firewallService.getStatus(gamePort, rconPort, restApiPort),
      firewallService.listCustomRules(),
    ])
    setRules(status)
    setCustomRules(custom)
    setLoading(false)
  }, [getPorts])

  useEffect(() => { refresh() }, [refresh])

  const handleToggle = async (rule: FirewallRuleStatus) => {
    const key = RULE_KEYS[rule.name]
    if (!key) return
    setBusy(rule.name)
    if (rule.active) {
      const res = await firewallService.disableRule(key)
      if (!res.success) notify(res.error ?? 'Erreur', 'error')
      else notify(`Règle "${rule.name}" supprimée`, 'success')
    } else {
      const res = await firewallService.enableRule(key, rule.port, rule.protocol)
      if (!res.success) notify(res.error ?? 'Erreur', 'error')
      else notify(`Règle "${rule.name}" ajoutée`, 'success')
    }
    await refresh()
    setBusy(null)
  }

  const handleApplyAll = async () => {
    setBusy('all')
    const { gamePort, rconPort, restApiPort } = await getPorts()
    const res = await firewallService.applyAll(gamePort, rconPort, restApiPort)
    if (!res.success) notify(res.errors.join('\n'), 'error')
    else notify('Toutes les règles ont été appliquées', 'success')
    await refresh()
    setBusy(null)
  }

  const handleRemoveAll = async () => {
    setBusy('all')
    await firewallService.removeAll()
    notify('Toutes les règles Palworld ont été supprimées', 'info')
    await refresh()
    setBusy(null)
  }

  const handleCreateCustomRule = async () => {
    const port = parseInt(newPort, 10)
    if (!newName.trim() || isNaN(port) || port < 1 || port > 65535) {
      notify('Nom et port valide (1-65535) requis', 'warning')
      return
    }
    setCreating(true)
    const res = await firewallService.createCustomRule(newName.trim(), port, newProtocol)
    if (!res.success) {
      notify(res.error ?? 'Erreur lors de la création', 'error')
    } else {
      notify(`Règle "${newName.trim()}" créée`, 'success')
      setNewName('')
      setNewPort('')
      await refresh()
    }
    setCreating(false)
  }

  const handleDeleteCustomRule = async (rule: FirewallRuleStatus) => {
    setBusy(`custom-${rule.name}-${rule.protocol}`)
    const res = await firewallService.deleteCustomRule(rule.name, rule.protocol)
    if (!res.success) notify(res.error ?? 'Erreur lors de la suppression', 'error')
    else notify(`Règle "${rule.name}" supprimée`, 'success')
    await refresh()
    setBusy(null)
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">Réseau & Pare-feu</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Gestion des règles Windows Defender Firewall pour le serveur Palworld
        </Typography>
      </Box>

      {/* Admin status */}
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <ShieldIcon sx={{ color: isAdmin ? 'success.main' : 'warning.main' }} />
            <Box>
              <Typography variant="subtitle2">Privilèges administrateur</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Requis pour modifier les règles de pare-feu
              </Typography>
            </Box>
          </Stack>
          {isAdmin === null ? (
            <CircularProgress size={20} />
          ) : (
            <Chip
              label={isAdmin ? 'Administrateur' : 'Non-administrateur'}
              color={isAdmin ? 'success' : 'warning'}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
        {isAdmin === false && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Relancez l'application en tant qu'administrateur pour modifier les règles de pare-feu.
          </Alert>
        )}
      </Paper>

      {/* Rules table */}
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
            Règles pare-feu
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Relire les ports depuis PalWorldSettings.ini et créer toutes les règles">
              <span>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={busy === 'all' ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
                  disabled={busy !== null || !isAdmin}
                  onClick={handleApplyAll}
                >
                  Tout appliquer
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Supprimer toutes les règles Palworld du pare-feu">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  disabled={busy !== null || !isAdmin}
                  onClick={handleRemoveAll}
                >
                  Tout supprimer
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Règle</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Port</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Proto</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>État</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.name} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="body2">{rule.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{rule.port}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={rule.protocol} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  </TableCell>
                  <TableCell>
                    {rule.active ? (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'success.main' }}>
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">Active</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.disabled' }}>
                        <CancelIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">Inactive</Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={rule.active ? 'outlined' : 'contained'}
                      color={rule.active ? 'error' : 'success'}
                      disabled={busy !== null || !isAdmin}
                      onClick={() => handleToggle(rule)}
                      sx={{ minWidth: 90 }}
                    >
                      {busy === rule.name ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : rule.active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Custom rules */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 2 }}>
          Règles personnalisées
        </Typography>

        {/* Create form */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2 }}>
          <TextField
            label="Nom"
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={!isAdmin || creating}
            sx={{ flex: 2 }}
          />
          <TextField
            label="Port"
            size="small"
            value={newPort}
            onChange={(e) => setNewPort(e.target.value.replace(/\D/g, ''))}
            disabled={!isAdmin || creating}
            inputProps={{ maxLength: 5 }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 90 }} disabled={!isAdmin || creating}>
            <InputLabel>Proto</InputLabel>
            <Select
              label="Proto"
              value={newProtocol}
              onChange={(e) => setNewProtocol(e.target.value as 'TCP' | 'UDP')}
            >
              <MenuItem value="UDP">UDP</MenuItem>
              <MenuItem value="TCP">TCP</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            startIcon={creating ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            disabled={!isAdmin || creating || !newName.trim() || !newPort}
            onClick={handleCreateCustomRule}
            sx={{ height: 40 }}
          >
            Créer
          </Button>
        </Stack>

        {customRules.length > 0 && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Nom</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Port</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Proto</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>État</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {customRules.map((rule) => (
                  <TableRow key={`${rule.name}-${rule.protocol}`} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2">{rule.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{rule.port}</Typography></TableCell>
                    <TableCell><Chip label={rule.protocol} size="small" variant="outlined" sx={{ fontSize: 10 }} /></TableCell>
                    <TableCell>
                      {rule.active ? (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'success.main' }}>
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Active</Typography>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.disabled' }}>
                          <CancelIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Inactive</Typography>
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Supprimer">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!isAdmin || busy !== null}
                            onClick={() => handleDeleteCustomRule(rule)}
                          >
                            {busy === `custom-${rule.name}-${rule.protocol}`
                              ? <CircularProgress size={16} color="inherit" />
                              : <DeleteIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {customRules.length === 0 && (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Aucune règle personnalisée
          </Typography>
        )}
      </Paper>

    </Stack>
  )
}
