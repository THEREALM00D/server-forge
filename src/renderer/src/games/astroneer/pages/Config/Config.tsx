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
import { astroConfigService } from "../../services/configService";
import { useConfigGroups } from "./hooks/useConfigGroups";
import ConfigGroup from "./components/ConfigGroup";
import ConfigField from "./components/ConfigField";
import type { Settings } from "./fields";

export default function AstroneerConfig() {
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
      const res = await astroConfigService.writeConfig(value);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else notify(res.error ?? t("config.unknownError"), "error");
    },
  });

  useEffect(() => {
    if (!state.serverPath) {
      setLoading(false);
      return;
    }
    astroConfigService.readConfig().then((settings) => {
      Object.entries(settings).forEach(([key, val]) =>
        form.setFieldValue(key as never, val as never),
      );
      setLoading(false);
    });
  }, [state.serverPath]);

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
        <Typography variant="h6">{t("astroneerConfig.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("astroneerConfig.subtitle")}
          </Typography>
          <Tooltip title={t("config.openFolder")}>
            <IconButton
              size="small"
              onClick={() =>
                window.api.shell.openPath(
                  state.serverPath + "/Astro/Saved/Config/WindowsServer",
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
                      onChange={(v) => f.handleChange(v as never)}
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
