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
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { useConfigGroups } from "./useConfigGroups";
import ConfigGroup from "./ConfigGroup";
import ConfigField from "./ConfigField";
import type { ConfigSettings, FieldGroup } from "./types";

const SAVE_FLASH_MS = 2000;

interface ConfigPageProps {
  titleKey: string;
  subtitleKey: string;
  /** Chemin du dossier de config .ini à ouvrir, dérivé du serverPath. */
  folderPath: (serverPath: string) => string;
  fieldGroups: FieldGroup[];
  /** Préfixe des clés i18n des champs (ex: "config.fields"). */
  i18nFieldsPrefix: string;
  readConfig: () => Promise<ConfigSettings>;
  writeConfig: (
    settings: ConfigSettings,
  ) => Promise<{ success: boolean; error?: string }>;
  /**
   * Appelé après le changement d'un champ — utilisé par Palworld pour
   * appliquer un preset de difficulté quand `Difficulty` change.
   */
  onFieldChange?: (
    key: string,
    value: string | number | boolean,
    setFieldValue: (key: string, value: string | number | boolean) => void,
  ) => void;
}

/**
 * Page de config .ini data-driven (groupes de champs, recherche,
 * expand/collapse) — partagée entre Palworld et Astroneer, qui ne diffèrent
 * que par le service de lecture/écriture, les clés i18n et (Palworld
 * uniquement) l'application d'un preset de difficulté au changement de champ.
 */
export default function ConfigPage({
  titleKey,
  subtitleKey,
  folderPath,
  fieldGroups,
  i18nFieldsPrefix,
  readConfig,
  writeConfig,
  onFieldChange,
}: ConfigPageProps) {
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
  } = useConfigGroups(fieldGroups, i18nFieldsPrefix);

  const form = useForm<ConfigSettings>({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      try {
        const res = await writeConfig(value);
        if (res.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), SAVE_FLASH_MS);
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
    readConfig()
      .then((settings) => {
        Object.entries(settings).forEach(([key, val]) =>
          form.setFieldValue(key as never, val as never),
        );
      })
      .catch(() => notify(t("config.loadFailed"), "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Typography variant="h6">{t(titleKey)}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(subtitleKey)}
          </Typography>
          <Tooltip title={t("config.openFolder")}>
            <IconButton
              size="small"
              onClick={() =>
                window.api.shell.openPath(folderPath(state.serverPath))
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
                      i18nPrefix={i18nFieldsPrefix}
                      onChange={(v) => {
                        f.handleChange(v as never);
                        onFieldChange?.(field.key, v, (k, val) =>
                          form.setFieldValue(k as never, val as never),
                        );
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
