import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import SyncIcon from "@mui/icons-material/Sync";
import { useServer } from "../../context/ServerContext";
import { steamService } from "../../games/palworld/services/steamService";
import { dialogService } from "../../services/dialogService";

interface UpdateStatus {
  checked: boolean;
  upToDate: boolean;
  installedBuild: string | null;
  requiredBuild: string | null;
}

export default function Install() {
  const { state, dispatch } = useServer();
  const [steamInstalled, setSteamInstalled] = useState<boolean | null>(null);
  const [installPath, setInstallPath] = useState(
    state.serverPath || "C:\\PalworldServer",
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    steamService.isInstalled().then(setSteamInstalled);
    if (state.serverPath) setInstallPath(state.serverPath);
  }, [state.serverPath]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const unsub = steamService.onProgress((msg) => setLogs((p) => [...p, msg]));
    return unsub;
  }, []);

  const addLog = (msg: string) => setLogs((p) => [...p, msg]);

  const handleBrowse = async () => {
    const folder = await dialogService.selectFolder();
    if (folder) setInstallPath(folder);
  };

  const handleInstallSteam = async () => {
    setRunning(true);
    setLogs([]);
    const res = await steamService.install();
    setSteamInstalled(res.success);
    if (!res.success) addLog(`Erreur: ${res.error}`);
    setRunning(false);
  };

  const handleInstallPalworld = async () => {
    if (!installPath) return;
    setRunning(true);
    setLogs([]);
    const res = await steamService.installPalworld(installPath);
    if (res.success) {
      dispatch({ type: "SET_SERVER_PATH", payload: installPath });
      setUpdateStatus(null);
    } else {
      addLog(`Erreur: ${res.error}`);
    }
    setRunning(false);
  };

  const handleUpdate = async () => {
    setRunning(true);
    setLogs([]);
    const res = await steamService.updatePalworld();
    if (res.success) setUpdateStatus(null);
    else addLog(`Erreur: ${res.error}`);
    setRunning(false);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    const result = await steamService.checkForUpdate();
    console.log("Update check result:", result);
    setUpdateStatus({ checked: true, ...result });
    setCheckingUpdate(false);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h6">Installation</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Installer ou mettre à jour le serveur Palworld via SteamCMD
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle2">SteamCMD</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {steamInstalled === null
                ? "Vérification..."
                : steamInstalled
                  ? "Installé"
                  : "Non installé"}
            </Typography>
          </Box>
          <Chip
            label={
              steamInstalled
                ? "OK"
                : steamInstalled === null
                  ? "..."
                  : "Manquant"
            }
            color={steamInstalled ? "success" : "default"}
            size="small"
          />
        </Stack>
        {!steamInstalled && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={running}
            onClick={handleInstallSteam}
          >
            Installer SteamCMD
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Dossier d'installation
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            placeholder="C:\PalworldServer"
          />
          <Button
            variant="outlined"
            onClick={handleBrowse}
            startIcon={<FolderOpenIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Parcourir
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            disabled={running || !steamInstalled}
            onClick={handleInstallPalworld}
          >
            {running ? "Installation..." : "Installer Palworld"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UpdateIcon />}
            disabled={running || !steamInstalled || !state.serverPath}
            onClick={handleUpdate}
          >
            Mettre à jour
          </Button>
        </Stack>
      </Paper>

      {state.serverPath && (
        <Paper sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: updateStatus?.checked ? 2 : 0,
            }}
          >
            <Box>
              <Typography variant="subtitle2">
                Mise à jour disponible ?
              </Typography>
              {updateStatus?.installedBuild && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Build installé : {updateStatus.installedBuild}
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<SyncIcon />}
              disabled={checkingUpdate || running || !steamInstalled}
              onClick={handleCheckUpdate}
            >
              {checkingUpdate ? "Connexion à Steam..." : "Vérifier"}
            </Button>
          </Stack>

          {updateStatus?.checked &&
            (updateStatus.upToDate ? (
              <Alert severity="success" sx={{ mt: 0 }}>
                Le serveur est à jour.
              </Alert>
            ) : updateStatus.installedBuild === null ? (
              <Alert severity="warning" sx={{ mt: 0 }}>
                Impossible de lire le build installé — le serveur est-il bien
                installé dans ce dossier ?
              </Alert>
            ) : (
              <Alert
                severity="warning"
                sx={{ mt: 0 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    disabled={running || !steamInstalled}
                    onClick={handleUpdate}
                  >
                    Mettre à jour
                  </Button>
                }
              >
                Mise à jour disponible
                {updateStatus.requiredBuild &&
                  ` (build ${updateStatus.requiredBuild})`}
                .
              </Alert>
            ))}
        </Paper>
      )}

      {logs.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Progression
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              height: 180,
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: 11,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <div ref={logsEndRef} />
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
