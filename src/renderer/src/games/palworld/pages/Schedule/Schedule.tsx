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
import { useNotification } from "../../../../context/NotificationContext";

export default function Schedule() {
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
        notify("API REST activée. Redémarrez le serveur.", "success");
        await checkApi();
      } else {
        notify(res.error || "Échec de l'activation");
      }
    } catch {
      notify("Impossible de modifier la configuration");
    }
  };

  const update = (patch: Partial<RestartConfig>) => {
    setCfg((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    await window.api.schedule.setRestart(cfg);
    setDirty(false);
    notify("Planification enregistrée", "success");
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Planification</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Redémarrage automatique quotidien du serveur
        </Typography>
      </Box>

      {apiEnabled === false && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleEnableApi}>
              Activer
            </Button>
          }
        >
          L'API REST est désactivée — sans elle, le redémarrage planifié ne
          pourra pas sauvegarder le monde avant l'arrêt.
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
          label="Activer le redémarrage planifié"
        />
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <TextField
            label="Heure (24h)"
            type="time"
            size="small"
            value={cfg.time}
            onChange={(e) => update({ time: e.target.value })}
            disabled={!cfg.enabled}
            sx={{ maxWidth: 200 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Avertissement (minutes avant)"
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
            helperText="Délai entre l'annonce et l'arrêt (0 = immédiat)"
          />
          <TextField
            label="Message d'annonce"
            size="small"
            value={cfg.message}
            onChange={(e) => update({ message: e.target.value })}
            disabled={!cfg.enabled}
            helperText="{minutes} sera remplacé par le délai"
            fullWidth
          />
        </Stack>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" disabled={!dirty} onClick={handleSave}>
            Enregistrer
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
