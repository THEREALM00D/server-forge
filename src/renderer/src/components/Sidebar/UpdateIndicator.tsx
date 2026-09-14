import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppUpdate } from "./hooks/useAppUpdate";

export default function UpdateIndicator() {
  const { t } = useTranslation();
  const update = useAppUpdate();
  if (!update) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
        mb: 1.5,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {t("sidebar.version", { version: update.currentVersion })}
      </Typography>
      {update.hasUpdate && (
        <Tooltip
          title={t("sidebar.updateAvailable", {
            version: update.latestVersion,
          })}
        >
          <Chip
            label={t("sidebar.updateBadge")}
            size="small"
            color="warning"
            onClick={() => window.api.shell.openExternal(update.url)}
            sx={{ fontSize: 10, height: 18, cursor: "pointer" }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
