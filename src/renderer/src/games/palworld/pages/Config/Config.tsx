import { useState, useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import { useServer } from "../../../../context/ServerContext";
import { useNotification } from "../../../../context/NotificationContext";
import { configService } from "../../services/configService";
import { FIELD_GROUPS, type Settings, type FieldGroup } from "./fields";
import { DIFFICULTY_PRESETS } from "./presets";
import ConfigGroup from "./components/ConfigGroup";
import ConfigField from "./components/ConfigField";

function filterGroups(groups: FieldGroup[], query: string): FieldGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => {
      const groupMatches = group.label.toLowerCase().includes(q);
      const fields = group.fields.filter((f) => {
        if (groupMatches) return true;
        return (
          f.label.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.description?.toLowerCase().includes(q) ?? false)
        );
      });
      return { ...group, fields };
    })
    .filter((g) => g.fields.length > 0);
}

export default function Config() {
  const { state } = useServer();
  const { notify } = useNotification();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const visibleGroups = useMemo(
    () => filterGroups(FIELD_GROUPS, search),
    [search],
  );

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

      <TextField
        size="small"
        placeholder="Rechercher un paramètre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch("")}
                  aria-label="Effacer la recherche"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Stack spacing={2}>
          {visibleGroups.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Aucun paramètre ne correspond à « {search} ».
            </Typography>
          )}
          {visibleGroups.map((group) => (
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
