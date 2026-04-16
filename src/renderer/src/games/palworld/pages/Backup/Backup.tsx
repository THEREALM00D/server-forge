import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useServer } from "../../../../context/ServerContext";
import { useNotification } from "../../../../context/NotificationContext";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("fr-FR");
}

export default function Backup() {
  const { state } = useServer();
  const { notify } = useNotification();
  const { status, serverPath } = state;

  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    backupDir: "",
    backupKeep: 10,
    backupIntervalMinutes: 0,
  });
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [list, cfg] = await Promise.all([
        window.api.backup.list(),
        window.api.backup.getConfig(),
      ]);
      setBackups(list);
      setConfig(cfg);
    } catch {
      notify("Impossible de charger les sauvegardes");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const entry = await window.api.backup.create();
      notify(`Sauvegarde créée : ${entry.name}`, "success");
      await refresh();
    } catch (e) {
      notify((e as Error).message || "Échec de la sauvegarde");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (entry: BackupEntry) => {
    if (
      !window.confirm(
        `Restaurer ${entry.name} ?\nLa sauvegarde actuelle sera écrasée.`,
      )
    ) {
      return;
    }
    setRestoring(entry.path);
    try {
      await window.api.backup.restore(entry.path);
      notify(`Sauvegarde restaurée : ${entry.name}`, "success");
    } catch (e) {
      notify((e as Error).message || "Échec de la restauration");
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (entry: BackupEntry) => {
    if (!window.confirm(`Supprimer ${entry.name} ?`)) return;
    try {
      await window.api.backup.delete(entry.path);
      notify("Sauvegarde supprimée", "success");
      await refresh();
    } catch {
      notify("Impossible de supprimer la sauvegarde");
    }
  };

  const handleSelectDir = async () => {
    const dir = await window.api.dialog.selectFolder();
    if (dir) {
      const next = { ...config, backupDir: dir };
      setConfig(next);
      await window.api.backup.setConfig(next);
      await refresh();
    }
  };

  const handleKeepChange = async (value: string) => {
    const n = Math.max(0, parseInt(value, 10) || 0);
    const next = { ...config, backupKeep: n };
    setConfig(next);
    await window.api.backup.setConfig(next);
  };

  const handleIntervalChange = async (value: number) => {
    const next = { ...config, backupIntervalMinutes: value };
    setConfig(next);
    await window.api.backup.setConfig(next);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Sauvegardes</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Gérez les sauvegardes du dossier SaveGames
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Configuration
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TextField
              label="Dossier de sauvegarde"
              size="small"
              value={config.backupDir}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
            <Tooltip title="Choisir un dossier">
              <IconButton onClick={handleSelectDir}>
                <FolderOpenIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <TextField
            label="Sauvegardes à conserver (rotation)"
            size="small"
            type="number"
            value={config.backupKeep}
            onChange={(e) => handleKeepChange(e.target.value)}
            sx={{ maxWidth: 280 }}
            slotProps={{ htmlInput: { min: 0 } }}
            helperText="0 = pas de rotation"
          />
          <FormControl size="small" sx={{ maxWidth: 280 }}>
            <InputLabel>Sauvegarde automatique</InputLabel>
            <Select
              label="Sauvegarde automatique"
              value={config.backupIntervalMinutes}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
            >
              <MenuItem value={0}>Désactivée</MenuItem>
              <MenuItem value={15}>Toutes les 15 minutes</MenuItem>
              <MenuItem value={30}>Toutes les 30 minutes</MenuItem>
              <MenuItem value={60}>Toutes les heures</MenuItem>
              <MenuItem value={180}>Toutes les 3 heures</MenuItem>
              <MenuItem value={360}>Toutes les 6 heures</MenuItem>
              <MenuItem value={720}>Toutes les 12 heures</MenuItem>
              <MenuItem value={1440}>Une fois par jour</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle2">
            Sauvegardes ({backups.length})
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={
              creating ? <CircularProgress size={14} /> : <BackupIcon />
            }
            disabled={!serverPath || creating}
            onClick={handleCreate}
          >
            {creating ? "Sauvegarde..." : "Créer une sauvegarde"}
          </Button>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        {backups.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Aucune sauvegarde
          </Typography>
        ) : (
          <Stack spacing={1}>
            {backups.map((b) => (
              <Box
                key={b.path}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.75,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {b.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {formatDate(b.createdAt)} — {formatSize(b.size)}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <Tooltip title="Restaurer (serveur arrêté requis)">
                    <span>
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={status === "running" || restoring !== null}
                        onClick={() => handleRestore(b)}
                      >
                        {restoring === b.path ? (
                          <CircularProgress size={18} />
                        ) : (
                          <RestoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(b)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
