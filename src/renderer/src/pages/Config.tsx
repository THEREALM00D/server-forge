import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  Box, Typography, Paper, Button, TextField,
  Switch, FormControlLabel, Stack, Divider, Alert
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useServer } from '../context/ServerContext'
import { configService } from '../services/configService'

type Settings = Record<string, string | number | boolean>
interface FieldDef { key: string; label: string; type: 'text' | 'number' | 'boolean' }
interface FieldGroup { label: string; fields: FieldDef[] }

const FIELD_GROUPS: FieldGroup[] = [
  {
    label: 'Serveur',
    fields: [
      { key: 'ServerName', label: 'Nom du serveur', type: 'text' },
      { key: 'ServerDescription', label: 'Description', type: 'text' },
      { key: 'PublicIP', label: 'IP publique', type: 'text' },
      { key: 'PublicPort', label: 'Port public', type: 'number' },
      { key: 'ServerPlayerMaxNum', label: 'Joueurs max', type: 'number' },
      { key: 'CoopPlayerMaxNum', label: 'Joueurs coop max', type: 'number' },
      { key: 'ServerPassword', label: 'Mot de passe serveur', type: 'text' },
      { key: 'AdminPassword', label: 'Mot de passe admin', type: 'text' },
      { key: 'Region', label: 'Région', type: 'text' },
    ],
  },
  {
    label: 'RCON',
    fields: [
      { key: 'RCONEnabled', label: 'Activer RCON', type: 'boolean' },
      { key: 'RCONPort', label: 'Port RCON', type: 'number' },
    ],
  },
  {
    label: 'REST API',
    fields: [
      { key: 'RESTAPIEnabled', label: 'Activer REST API', type: 'boolean' },
      { key: 'RESTAPIPort', label: 'Port REST API', type: 'number' },
    ],
  },
  {
    label: 'Sécurité / Auth',
    fields: [
      { key: 'bUseAuth', label: 'Authentification requise', type: 'boolean' },
      { key: 'BanListURL', label: 'URL liste de bans', type: 'text' },
      { key: 'CrossplayPlatforms', label: 'Plateformes crossplay', type: 'text' },
      { key: 'bAllowClientMod', label: 'Autoriser mods client', type: 'boolean' },
    ],
  },
  {
    label: 'Temps & Vitesse',
    fields: [
      { key: 'DayTimeSpeedRate', label: 'Vitesse journée', type: 'number' },
      { key: 'NightTimeSpeedRate', label: 'Vitesse nuit', type: 'number' },
    ],
  },
  {
    label: 'XP & Collecte',
    fields: [
      { key: 'ExpRate', label: "Taux d'XP", type: 'number' },
      { key: 'CollectionDropRate', label: 'Taux de collecte', type: 'number' },
      { key: 'CollectionObjectHpRate', label: 'HP objets collectables', type: 'number' },
      { key: 'CollectionObjectRespawnSpeedRate', label: 'Respawn objets collectables', type: 'number' },
      { key: 'EnemyDropItemRate', label: 'Drop ennemi', type: 'number' },
    ],
  },
  {
    label: 'Mécaniques Pal',
    fields: [
      { key: 'PalCaptureRate', label: 'Taux de capture Pal', type: 'number' },
      { key: 'PalSpawnNumRate', label: 'Taux de spawn Pal', type: 'number' },
      { key: 'PalDamageRateAttack', label: 'Dégâts Pal (attaque)', type: 'number' },
      { key: 'PalDamageRateDefense', label: 'Dégâts Pal (défense)', type: 'number' },
      { key: 'PalStomachDecreaceRate', label: 'Faim Pal', type: 'number' },
      { key: 'PalStaminaDecreaceRate', label: 'Stamina Pal', type: 'number' },
      { key: 'PalAutoHPRegeneRate', label: 'Régén HP Pal', type: 'number' },
      { key: 'PalAutoHpRegeneRateInSleep', label: 'Régén HP Pal (sommeil)', type: 'number' },
      { key: 'PalEggDefaultHatchingTime', label: "Temps d'éclosion (h)", type: 'number' },
      { key: 'bPalLost', label: 'Perte Pal à la mort', type: 'boolean' },
    ],
  },
  {
    label: 'Statistiques joueur',
    fields: [
      { key: 'PlayerDamageRateAttack', label: 'Dégâts joueur (attaque)', type: 'number' },
      { key: 'PlayerDamageRateDefense', label: 'Dégâts joueur (défense)', type: 'number' },
      { key: 'PlayerStomachDecreaceRate', label: 'Faim joueur', type: 'number' },
      { key: 'PlayerStaminaDecreaceRate', label: 'Stamina joueur', type: 'number' },
      { key: 'PlayerAutoHPRegeneRate', label: 'Régén HP joueur', type: 'number' },
      { key: 'PlayerAutoHpRegeneRateInSleep', label: 'Régén HP joueur (sommeil)', type: 'number' },
    ],
  },
  {
    label: 'Points de statistiques',
    fields: [
      { key: 'bAllowEnhanceStat_Attack', label: 'Amélioration Attaque', type: 'boolean' },
      { key: 'bAllowEnhanceStat_Health', label: 'Amélioration Santé', type: 'boolean' },
      { key: 'bAllowEnhanceStat_Stamina', label: 'Amélioration Endurance', type: 'boolean' },
      { key: 'bAllowEnhanceStat_Weight', label: 'Amélioration Poids', type: 'boolean' },
      { key: 'bAllowEnhanceStat_WorkSpeed', label: 'Amélioration Vitesse travail', type: 'boolean' },
    ],
  },
  {
    label: 'Constructions',
    fields: [
      { key: 'BuildObjectDamageRate', label: 'Dégâts aux constructions', type: 'number' },
      { key: 'BuildObjectDeteriorationDamageRate', label: 'Détérioration constructions', type: 'number' },
      { key: 'BaseCampMaxNum', label: 'Camps de base max', type: 'number' },
      { key: 'BaseCampWorkerMaxNum', label: 'Travailleurs camp max', type: 'number' },
      { key: 'BaseCampMaxNumInGuild', label: 'Camps max par guilde', type: 'number' },
      { key: 'MaxBuildingLimitNum', label: 'Bâtiments max (0 = illimité)', type: 'number' },
      { key: 'bBuildAreaLimit', label: 'Limiter zone de construction', type: 'boolean' },
    ],
  },
  {
    label: 'Objets & Équipement',
    fields: [
      { key: 'WorkSpeedRate', label: 'Vitesse de travail', type: 'number' },
      { key: 'DropItemMaxNum', label: 'Objets au sol max', type: 'number' },
      { key: 'DropItemAliveMaxHours', label: "Durée de vie objets au sol (h)", type: 'number' },
      { key: 'EquipmentDurabilityDamageRate', label: 'Dégâts durabilité équipement', type: 'number' },
      { key: 'ItemWeightRate', label: 'Poids des objets', type: 'number' },
      { key: 'ItemCorruptionMultiplier', label: 'Multiplicateur corruption', type: 'number' },
    ],
  },
  {
    label: 'Mort & Pénalités',
    fields: [
      { key: 'DeathPenalty', label: 'Pénalité de mort', type: 'text' },
      { key: 'BlockRespawnTime', label: 'Temps de blocage respawn', type: 'number' },
      { key: 'RespawnPenaltyDurationThreshold', label: 'Seuil durée pénalité respawn', type: 'number' },
      { key: 'RespawnPenaltyTimeScale', label: 'Échelle temps pénalité respawn', type: 'number' },
    ],
  },
  {
    label: 'Guilde',
    fields: [
      { key: 'GuildPlayerMaxNum', label: 'Membres guilde max', type: 'number' },
      { key: 'GuildRejoinCooldownMinutes', label: 'Délai rejoin guilde (min)', type: 'number' },
      { key: 'bAutoResetGuildNoOnlinePlayers', label: 'Reset guilde si inactif', type: 'boolean' },
      { key: 'AutoResetGuildTimeNoOnlinePlayers', label: 'Délai reset guilde (h)', type: 'number' },
    ],
  },
  {
    label: 'PvP',
    fields: [
      { key: 'bIsPvP', label: 'PvP activé', type: 'boolean' },
      { key: 'bEnablePlayerToPlayerDamage', label: 'Dégâts joueur → joueur', type: 'boolean' },
      { key: 'bEnableFriendlyFire', label: 'Tir allié', type: 'boolean' },
      { key: 'bCanPickupOtherGuildDeathPenaltyDrop', label: 'Ramasser drop mort guilde adverse', type: 'boolean' },
      { key: 'bAdditionalDropItemWhenPlayerKillingInPvPMode', label: 'Drop extra en PvP', type: 'boolean' },
      { key: 'AdditionalDropItemNumWhenPlayerKillingInPvPMode', label: 'Nb objets drop PvP', type: 'number' },
      { key: 'AdditionalDropItemWhenPlayerKillingInPvPMode', label: 'Objet drop PvP (ID)', type: 'text' },
      { key: 'bEnableDefenseOtherGuildPlayer', label: 'Défense joueur guilde adverse', type: 'boolean' },
      { key: 'bDisplayPvPItemNumOnWorldMap_Player', label: 'Afficher items PvP carte (joueur)', type: 'boolean' },
      { key: 'bDisplayPvPItemNumOnWorldMap_BaseCamp', label: 'Afficher items PvP carte (camp)', type: 'boolean' },
    ],
  },
  {
    label: 'Gameplay',
    fields: [
      { key: 'Difficulty', label: 'Difficulté', type: 'text' },
      { key: 'bIsMultiplay', label: 'Multijoueur', type: 'boolean' },
      { key: 'bHardcore', label: 'Mode Hardcore', type: 'boolean' },
      { key: 'bCharacterRecreateInHardcore', label: 'Recréer perso en Hardcore', type: 'boolean' },
      { key: 'bEnableFastTravel', label: 'Voyage rapide', type: 'boolean' },
      { key: 'bEnableFastTravelOnlyBaseCamp', label: 'Voyage rapide — camp seulement', type: 'boolean' },
      { key: 'bIsStartLocationSelectByMap', label: 'Choix spawn par carte', type: 'boolean' },
      { key: 'bExistPlayerAfterLogout', label: 'Corps présent après déconnexion', type: 'boolean' },
      { key: 'bEnableInvaderEnemy', label: 'Ennemis envahisseurs', type: 'boolean' },
      { key: 'bEnableNonLoginPenalty', label: 'Pénalité déconnexion', type: 'boolean' },
      { key: 'bEnableAimAssistPad', label: 'Aide visée manette', type: 'boolean' },
      { key: 'bEnableAimAssistKeyboard', label: 'Aide visée clavier', type: 'boolean' },
      { key: 'bIsShowJoinLeftMessage', label: 'Message connexion/déconnexion', type: 'boolean' },
      { key: 'bShowPlayerList', label: 'Afficher liste joueurs', type: 'boolean' },
      { key: 'bIsUseBackupSaveData', label: 'Sauvegarde backup', type: 'boolean' },
      { key: 'bAllowGlobalPalboxExport', label: 'Export Palbox global', type: 'boolean' },
      { key: 'bAllowGlobalPalboxImport', label: 'Import Palbox global', type: 'boolean' },
      { key: 'bInvisibleOtherGuildBaseCampAreaFX', label: 'Masquer zone camp guilde adverse', type: 'boolean' },
      { key: 'bActiveUNKO', label: 'Activer UNKO', type: 'boolean' },
      { key: 'DenyTechnologyList', label: 'Technologies interdites', type: 'text' },
    ],
  },
  {
    label: 'Randomiseur',
    fields: [
      { key: 'RandomizerType', label: 'Type de randomiseur', type: 'text' },
      { key: 'RandomizerSeed', label: 'Graine', type: 'number' },
      { key: 'bIsRandomizerPalLevelRandom', label: 'Niveau Pal aléatoire', type: 'boolean' },
    ],
  },
  {
    label: 'Ravitaillement & Chat',
    fields: [
      { key: 'SupplyDropSpan', label: 'Intervalle ravitaillement (min)', type: 'number' },
      { key: 'ChatPostLimitPerMinute', label: 'Messages chat/min max', type: 'number' },
    ],
  },
  {
    label: 'Performance & Logs',
    fields: [
      { key: 'ServerReplicatePawnCullDistance', label: 'Distance culling serveur', type: 'number' },
      { key: 'LogFormatType', label: 'Format des logs', type: 'text' },
    ],
  },
]

export default function Config() {
  const { state } = useServer()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const form = useForm<Settings>({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      setError('')
      const res = await configService.writePalConfig(value)
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
      else setError(res.error ?? 'Erreur inconnue')
    },
  })

  useEffect(() => {
    if (!state.serverPath) { setLoading(false); return }
    configService.readPalConfig().then((settings) => {
      Object.entries(settings).forEach(([key, val]) => form.setFieldValue(key as never, val as never))
      setLoading(false)
    })
  }, [state.serverPath])

  if (!state.serverPath) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
        <Typography sx={{ color: 'text.secondary' }}>Configurez le chemin serveur dans Installation.</Typography>
      </Box>
    )
  }

  if (loading) return <Typography sx={{ color: 'text.secondary' }}>Chargement...</Typography>

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">Configuration</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>PalWorldSettings.ini</Typography>
      </Box>

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
        <Stack spacing={2}>
          {FIELD_GROUPS.map((group) => (
            <Paper key={group.label} sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 2 }}>
                {group.label}
              </Typography>
              <Stack spacing={1.5}>
                {group.fields.map(({ key, label, type }, idx) => (
                  <form.Field key={key} name={key as never}>
                    {(field) => (
                      <>
                        {idx > 0 && <Divider />}
                        {type === 'boolean' ? (
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={!!field.state.value}
                                onChange={(e) => field.handleChange(e.target.checked as never)}
                              />
                            }
                            label={<Typography variant="body2">{label}</Typography>}
                            sx={{ justifyContent: 'space-between', ml: 0, flexDirection: 'row-reverse' }}
                          />
                        ) : (
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ minWidth: 200 }}>{label}</Typography>
                            <TextField
                              size="small"
                              type={type === 'number' ? 'number' : 'text'}
                              slotProps={{ htmlInput: { step: type === 'number' ? 'any' : undefined } }}
                              value={String(field.state.value ?? '')}
                              onChange={(e) =>
                                field.handleChange(
                                  (type === 'number' ? Number(e.target.value) : e.target.value) as never
                                )
                              }
                              sx={{ flex: 1 }}
                            />
                          </Stack>
                        )}
                      </>
                    )}
                  </form.Field>
                ))}
              </Stack>
            </Paper>
          ))}

          {error && <Alert severity="error">{error}</Alert>}

          <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} color={saved ? 'success' : 'primary'}>
            {saved ? 'Sauvegardé !' : 'Sauvegarder la configuration'}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
