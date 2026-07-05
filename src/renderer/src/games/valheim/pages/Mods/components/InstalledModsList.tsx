import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useTranslation } from "react-i18next";
import type { ValheimMod, ModUpdate } from "@shared/types";
import { formatDate } from "../../../../../utils/format";

interface Props {
  mods: ValheimMod[];
  locale: string;
  updates: ModUpdate[];
  onRemove: (modId: number, name: string) => void;
  onToggle: (modId: number, enabled: boolean) => void;
  onUpdate: (latestCode: string) => void;
}

export default function InstalledModsList({
  mods,
  locale,
  updates,
  onRemove,
  onToggle,
  onUpdate,
}: Props) {
  const { t } = useTranslation();

  const updateMap = new Map(updates.map((u) => [u.installedCode, u]));

  if (mods.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.installed.empty")}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack divider={<Divider />} spacing={0}>
        {mods.map((mod) => {
          const update = mod.thunderstoreCode
            ? updateMap.get(mod.thunderstoreCode)
            : undefined;

          return (
            <Box
              key={mod.modId}
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}
            >
              {mod.pictureUrl && (
                <Box
                  component="img"
                  src={mod.pictureUrl}
                  alt={mod.name}
                  sx={{
                    width: 56,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {mod.name}{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("valheimMods.installed.version", {
                        version: mod.version,
                      })}
                    </Typography>
                  </Typography>
                  {mod.source === "manual" && (
                    <Chip
                      label={t("valheimMods.installed.manual")}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 10, height: 18, px: 0 }}
                    />
                  )}
                  {mod.source === "thunderstore" && (
                    <Chip
                      label="Thunderstore"
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ fontSize: 10, height: 18, px: 0 }}
                    />
                  )}
                  {update && (
                    <Chip
                      label={t("valheimMods.updates.newVersion", {
                        version: update.latestVersion,
                      })}
                      size="small"
                      color="warning"
                      sx={{ fontSize: 10, height: 18, px: 0.5 }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                  noWrap
                >
                  {mod.author || "—"}{" "}
                  {mod.installedAt > 0 &&
                    `— ${t("valheimMods.installed.installedAt", { date: formatDate(mod.installedAt, locale) })}`}
                </Typography>
              </Box>
              <Tooltip
                title={
                  mod.enabled
                    ? t("valheimMods.installed.enabled")
                    : t("valheimMods.installed.disabled")
                }
              >
                <Switch
                  size="small"
                  checked={mod.enabled}
                  onChange={(e) => onToggle(mod.modId, e.target.checked)}
                />
              </Tooltip>
              {update && (
                <Tooltip
                  title={t("valheimMods.updates.updateBtn", {
                    version: update.latestVersion,
                  })}
                >
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => onUpdate(update.latestCode)}
                  >
                    <SystemUpdateAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t("valheimMods.installed.remove")}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(mod.modId, mod.name)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
