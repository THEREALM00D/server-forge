import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { ValheimMod } from "@shared/types";
import { formatDate } from "../../../../../utils/format";

interface Props {
  mods: ValheimMod[];
  locale: string;
  onRemove: (modId: number, name: string) => void;
  onToggle: (modId: number, enabled: boolean) => void;
}

export default function InstalledModsList({
  mods,
  locale,
  onRemove,
  onToggle,
}: Props) {
  const { t } = useTranslation();

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
        {mods.map((mod) => (
          <Box
            key={mod.modId}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1.5,
            }}
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
              <Typography
                variant="caption"
                sx={{ color: "text.secondary" }}
                noWrap
              >
                {mod.author} —{" "}
                {t("valheimMods.installed.installedAt", {
                  date: formatDate(mod.installedAt, locale),
                })}
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
        ))}
      </Stack>
    </Paper>
  );
}
