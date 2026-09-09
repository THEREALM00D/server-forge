import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useNotification } from "../../../../context/NotificationContext";
import { configService } from "../../services/configService";
import { DIFFICULTY_PRESETS } from "./presets";
import { useConfigGroups } from "./hooks/useConfigGroups";
import ConfigGroup from "../../../../components/config/ConfigGroup";
import ConfigField from "../../../../components/config/ConfigField";
import type { Settings } from "./fields";

export default function Config() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { notify } = useNotification();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    search,
    setSearch,
    visibleGroups,
    expandedGroups,
    allExpanded,
    toggleAll,
    toggleGroup,
  } = useConfigGroups();

  const form = useForm<Settings>({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      try {
        const res = await configService.writePalConfig(value);
        if (res.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else notify(res.error ?? t("config.unknownError"), "error");
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
  });

  useEffect(() => {
    if (!state.serverPath) {
      setLoading(false);
      return;
    }
    configService
      .readPalConfig()
      .then((settings) => {
        Object.entries(settings).forEach(([key, val]) =>
          form.setFieldValue(key as never, val as never),
        );
      })
      .catch(() => notify(t("config.loadFailed"), "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {t("config.noServerPath")}
        </Typography>
      </Box>
    );
  }

  if (loading)
    return (
      <Typography sx={{ color: "text.secondary" }}>
        {t("common.loading")}
      </Typography>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">{t("config.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("config.subtitle")}
          </Typography>
          <Tooltip title={t("config.openFolder")}>
            <IconButton
              size="small"
              onClick={() =>
                window.api.shell.openPath(
                  state.serverPath + "/Pal/Saved/Config/WindowsServer",
                )
              }
            >
              <FolderOpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          placeholder={t("config.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
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
                    aria-label={t("config.searchClear")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Tooltip
          title={allExpanded ? t("config.collapseAll") : t("config.expandAll")}
        >
          <IconButton size="small" onClick={toggleAll}>
            {allExpanded ? (
              <UnfoldLessIcon fontSize="small" />
            ) : (
              <UnfoldMoreIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Stack spacing={2}>
          {visibleGroups.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("config.noResults", { query: search })}
            </Typography>
          )}
          {visibleGroups.map((group) => (
            <ConfigGroup
              key={group.labelKey}
              group={group}
              expanded={expandedGroups.has(group.labelKey)}
              onToggle={() => toggleGroup(group.labelKey)}
              renderField={(field) => (
                <form.Field name={field.key as never}>
                  {(f) => (
                    <ConfigField
                      field={field}
                      value={f.state.value as string | number | boolean}
                      i18nPrefix="config.fields"
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
            {saved ? t("config.saved") : t("config.save")}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
