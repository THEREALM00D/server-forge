import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../context/NotificationContext";
import type { RestartConfig } from "@shared/types";

export default function Schedule() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [cfg, setCfg] = useState<RestartConfig>({
    enabled: false,
    time: "04:00",
    warningMinutes: 5,
    message: "Le serveur va redémarrer dans {minutes} minutes",
  });
  const [dirty, setDirty] = useState(false);
  const [apiEnabled, setApiEnabled] = useState<boolean | null>(null);

  const checkApi = async () => {
    try {
      const settings = await window.api.palconfig.read();
      setApiEnabled(settings.RESTAPIEnabled === true);
    } catch {
      setApiEnabled(null);
    }
  };

  useEffect(() => {
    window.api.schedule.getRestart().then(setCfg);
    checkApi();
  }, []);

  const handleEnableApi = async () => {
    try {
      const settings = await window.api.palconfig.read();
      const res = await window.api.palconfig.write({
        ...settings,
        RESTAPIEnabled: true,
      });
      if (res.success) {
        notify(t("schedule.notify.apiEnabled"), "success");
        await checkApi();
      } else {
        notify(res.error || t("schedule.notify.apiEnableFailed"));
      }
    } catch {
      notify(t("schedule.notify.apiCannotWrite"));
    }
  };

  const update = (patch: Partial<RestartConfig>) => {
    setCfg((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    await window.api.schedule.setRestart(cfg);
    setDirty(false);
    notify(t("schedule.notify.saved"), "success");
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("schedule.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("schedule.subtitle")}
        </Typography>
      </Box>

      {apiEnabled === false && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleEnableApi}>
              {t("schedule.enableApi")}
            </Button>
          }
        >
          {t("schedule.apiWarning")}
        </Alert>
      )}

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
