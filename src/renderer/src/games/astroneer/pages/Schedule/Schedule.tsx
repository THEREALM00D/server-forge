import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../context/NotificationContext";
import type { RestartConfig } from "@shared/types";

export default function AstroneerSchedule() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [cfg, setCfg] = useState<RestartConfig>({
    enabled: false,
    time: "04:00",
    warningMinutes: 5,
    message: "Le serveur va redémarrer dans {minutes} minutes",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    window.api.schedule
      .getRestart()
      .then(setCfg)
      .catch((e) => notify((e as Error).message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<RestartConfig>) => {
    setCfg((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await window.api.schedule.setRestart(cfg);
      setDirty(false);
      notify(t("schedule.notify.saved"), "success");
    } catch (e) {
      notify((e as Error).message || t("schedule.notify.saveFailed"), "error");
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("schedule.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("schedule.subtitle")}
        </Typography>
      </Box>

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ fontSize: 13 }}
      >
        {t("astroneerSchedule.noApiInfo")}
      </Alert>

      <Paper sx={{ p: 2.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={cfg.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
          }
          label={t("schedule.enabled")}
        />
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <TextField
            label={t("schedule.time")}
            type="time"
            size="small"
            value={cfg.time}
            onChange={(e) => update({ time: e.target.value })}
            disabled={!cfg.enabled}
            sx={{ maxWidth: 200 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label={t("schedule.warning")}
            type="number"
            size="small"
            value={cfg.warningMinutes}
            onChange={(e) =>
              update({
                warningMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            disabled={!cfg.enabled}
            sx={{ maxWidth: 280 }}
            slotProps={{ htmlInput: { min: 0 } }}
            helperText={t("schedule.warningHelper")}
          />
          <TextField
            label={t("schedule.message")}
            size="small"
            value={cfg.message}
            onChange={(e) => update({ message: e.target.value })}
            disabled={!cfg.enabled}
            helperText={t("schedule.messageHelper")}
            fullWidth
          />
        </Stack>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" disabled={!dirty} onClick={handleSave}>
            {t("schedule.save")}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
