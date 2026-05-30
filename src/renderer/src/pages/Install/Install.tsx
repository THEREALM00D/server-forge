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
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import SyncIcon from "@mui/icons-material/Sync";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { steamService } from "../../games/palworld/services/steamService";
import { dialogService } from "../../services/dialogService";
import type { LaunchArgsConfig } from "@shared/types";

interface UpdateStatus {
  checked: boolean;
  upToDate: boolean;
  installedBuild: string | null;
  requiredBuild: string | null;
}

const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

export default function Install() {
  const { t } = useTranslation();
  const { state, refreshServers } = useServer();
  const { notify } = useNotification();
  const [steamInstalled, setSteamInstalled] = useState<boolean | null>(null);
  const gameType = state.activeServer?.gameType ?? "palworld";

  const [installPath, setInstallPath] = useState(
    state.serverPath ||
      (gameType === "valheim" ? "C:\\ValheimServer" : "C:\\PalworldServer"),
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [launchArgs, setLaunchArgs] =
    useState<LaunchArgsConfig>(DEFAULT_LAUNCH_ARGS);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    steamService.isInstalled().then(setSteamInstalled);
    if (state.serverPath) setInstallPath(state.serverPath);
  }, [state.serverPath]);

  useEffect(() => {
    window.api.server.getLaunchArgs().then(setLaunchArgs);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const unsub = steamService.onProgress((msg) => setLogs((p) => [...p, msg]));
    return unsub;
  }, []);

  const updateLaunchArgs = async (patch: Partial<LaunchArgsConfig>) => {
    const next = { ...launchArgs, ...patch };
    setLaunchArgs(next);
    await window.api.server.setLaunchArgs(next);
    notify(t("install.launchArgs.saved"), "info");
  };

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
    if (!res.success) addLog(t("install.errorPrefix", { msg: res.error }));
    setRunning(false);
  };

  const handleInstallGame = async () => {
    if (!installPath) return;
    setRunning(true);
    setLogs([]);
    const res =
      gameType === "valheim"
        ? await window.api.steamcmd.installValheim(installPath)
        : await steamService.installPalworld(installPath);
    if (res.success) {
      await refreshServers();
      setUpdateStatus(null);
    } else {
      addLog(t("install.errorPrefix", { msg: res.error }));
    }
    setRunning(false);
  };

  const handleUpdate = async () => {
    setRunning(true);
    setLogs([]);
    const res =
      gameType === "valheim"
        ? await window.api.steamcmd.updateValheim()
        : await steamService.updatePalworld();
    if (res.success) setUpdateStatus(null);
    else addLog(t("install.errorPrefix", { msg: res.error }));
    setRunning(false);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    const result = await steamService.checkForUpdate();
    setUpdateStatus({ checked: true, ...result });
    setCheckingUpdate(false);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h6">{t("install.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t(
            gameType === "valheim"
              ? "install.subtitleValheim"
              : "install.subtitle",
          )}
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle2">
              {t("install.steamcmd.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {steamInstalled === null
                ? t("install.steamcmd.checking")
                : steamInstalled
                  ? t("install.steamcmd.installed")
                  : t("install.steamcmd.notInstalled")}
            </Typography>
          </Box>
          <Chip
            label={
              steamInstalled
                ? t("install.steamcmd.statusOk")
                : steamInstalled === null
                  ? "..."
                  : t("install.steamcmd.statusMissing")
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
            {t("install.steamcmd.install")}
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t("install.folder.title")}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            placeholder={
              gameType === "valheim"
                ? "C:\\ValheimServer"
                : "C:\\PalworldServer"
            }
          />
          <Button
            variant="outlined"
            onClick={handleBrowse}
            startIcon={<FolderOpenIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            {t("common.browse")}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            disabled={running || !steamInstalled}
            onClick={handleInstallGame}
          >
            {running
              ? t("install.folder.installing")
              : gameType === "valheim"
                ? t("install.folder.installValheim")
                : t("install.folder.installPalworld")}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UpdateIcon />}
            disabled={running || !steamInstalled || !state.serverPath}
            onClick={handleUpdate}
          >
            {t("install.folder.update")}
          </Button>
        </Stack>
      </Paper>

      {gameType === "palworld" && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {t("install.launchArgs.title")}
          </Typography>
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={launchArgs.publicLobby}
                  onChange={(e) =>
                    updateLaunchArgs({ publicLobby: e.target.checked })
                  }
                />
              }
              label={
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2">
                    {t("install.launchArgs.publicLobby")}
                  </Typography>
                  <Tooltip
                    arrow
                    placement="top"
                    title={t("install.launchArgs.publicLobbyTooltip")}
                  >
                    <InfoOutlinedIcon
                      sx={{
                        fontSize: 16,
                        color: "text.secondary",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                </Stack>
              }
              sx={{
                justifyContent: "space-between",
                ml: 0,
                flexDirection: "row-reverse",
              }}
            />
            <Divider />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={launchArgs.performanceFlags}
                  onChange={(e) =>
                    updateLaunchArgs({ performanceFlags: e.target.checked })
                  }
                />
              }
              label={
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2">
                    {t("install.launchArgs.performanceFlags")}
                  </Typography>
                  <Tooltip
                    arrow
                    placement="top"
                    title={t("install.launchArgs.performanceFlagsTooltip")}
                  >
                    <InfoOutlinedIcon
                      sx={{
                        fontSize: 16,
                        color: "text.secondary",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                </Stack>
              }
              sx={{
                justifyContent: "space-between",
                ml: 0,
                flexDirection: "row-reverse",
              }}
            />
            <Divider />
            <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
              <Stack
                direction="row"
                sx={{ alignItems: "center", gap: 0.5, minWidth: 200 }}
              >
                <Typography variant="body2">
                  {t("install.launchArgs.customArgs")}
                </Typography>
                <Tooltip
                  arrow
                  placement="top"
                  title={t("install.launchArgs.customArgsTooltip")}
                >
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 16,
                      color: "text.secondary",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </Stack>
              <TextField
                size="small"
                placeholder="-log -port=8211"
                value={launchArgs.customArgs}
                onChange={(e) =>
                  setLaunchArgs({ ...launchArgs, customArgs: e.target.value })
                }
                onBlur={() =>
                  updateLaunchArgs({ customArgs: launchArgs.customArgs })
                }
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

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
                {t("install.update.title")}
              </Typography>
              {updateStatus?.installedBuild && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("install.update.installedBuild", {
                    build: updateStatus.installedBuild,
                  })}
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
              {checkingUpdate
                ? t("install.update.checking")
                : t("install.update.check")}
            </Button>
          </Stack>

          {updateStatus?.checked &&
            (updateStatus.upToDate ? (
              <Alert severity="success" sx={{ mt: 0 }}>
                {t("install.update.upToDate")}
              </Alert>
            ) : updateStatus.installedBuild === null ? (
              <Alert severity="warning" sx={{ mt: 0 }}>
                {t("install.update.cannotRead")}
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
                    {t("install.folder.update")}
                  </Button>
                }
              >
                {updateStatus.requiredBuild
                  ? t("install.update.availableWithBuild", {
                      build: updateStatus.requiredBuild,
                    })
                  : t("install.update.available")}
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
            {t("install.progress")}
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
