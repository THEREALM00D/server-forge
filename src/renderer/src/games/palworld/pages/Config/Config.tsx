import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Box, Button, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useServer } from "../../../../context/ServerContext";
import { useNotification } from "../../../../context/NotificationContext";
import { configService } from "../../services/configService";
import { FIELD_GROUPS, type Settings } from "./fields";
import { DIFFICULTY_PRESETS } from "./presets";
import ConfigGroup from "./components/ConfigGroup";
import ConfigField from "./components/ConfigField";

export default function Config() {
  const { state } = useServer();
  const { notify } = useNotification();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<Settings>({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      const res = await configService.writePalConfig(value);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else notify(res.error ?? "Erreur inconnue", "error");
    },
  });

  useEffect(() => {
    if (!state.serverPath) {
      setLoading(false);
      return;
    }
    configService.readPalConfig().then((settings) => {
      Object.entries(settings).forEach(([key, val]) =>
        form.setFieldValue(key as never, val as never),
      );
      setLoading(false);
    });
  }, [state.serverPath]);

  const applyDifficultyPreset = (difficulty: string) => {
    const preset = DIFFICULTY_PRESETS[difficulty];
    if (!preset) return;
    Object.entries(preset).forEach(([k, v]) =>
      form.setFieldValue(k as never, v as never),
    );
  };

  if (!state.serverPath) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60%",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>
          Configurez le chemin serveur dans Installation.
        </Typography>
      </Box>
    );
  }

  if (loading)
    return (
      <Typography sx={{ color: "text.secondary" }}>Chargement...</Typography>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">Configuration</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          PalWorldSettings.ini
        </Typography>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Stack spacing={2}>
          {FIELD_GROUPS.map((group) => (
            <ConfigGroup
              key={group.label}
              group={group}
              renderField={(field) => (
                <form.Field name={field.key as never}>
                  {(f) => (
                    <ConfigField
                      field={field}
                      value={f.state.value as string | number | boolean}
                      onChange={(v) => {
                        f.handleChange(v as never);
                        if (field.key === "Difficulty")
                          applyDifficultyPreset(String(v));
                      }}
                    />
                  )}
                </form.Field>
              )}
            />
          ))}

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            color={saved ? "success" : "primary"}
          >
            {saved ? "Sauvegardé !" : "Sauvegarder la configuration"}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
