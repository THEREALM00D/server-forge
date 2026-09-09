import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";

export default function SteamCmdCard({
  steamInstalled,
  running,
  onInstall,
}: {
  steamInstalled: boolean | null;
  running: boolean;
  onInstall: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle2">
            {t("install.steamcmd.label")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {steamInstalled === null
              ? t("install.steamcmd.checking")
              : steamInstalled
                ? t("install.steamcmd.installed")
                : t("install.steamcmd.notInstalled")}
          </Typography>
        </Box>
        <Chip
          label={
            steamInstalled
              ? t("install.steamcmd.statusOk")
              : steamInstalled === null
                ? "..."
                : t("install.steamcmd.statusMissing")
          }
          color={steamInstalled ? "success" : "default"}
          size="small"
        />
      </Stack>
      {!steamInstalled && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DownloadIcon />}
          disabled={running}
          onClick={onInstall}
        >
          {t("install.steamcmd.install")}
        </Button>
      )}
    </Paper>
  );
}
