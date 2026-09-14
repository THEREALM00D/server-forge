import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import { useAppUpdate } from "./hooks/useAppUpdate";

export default function UpdateIndicator() {
  const { t } = useTranslation();
  const { currentVersion, status, download, install } = useAppUpdate();

  return (
    <Box sx={{ textAlign: "center", mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {t("sidebar.version", { version: currentVersion })}
      </Typography>

      {status.state === "checking" && (
        <Typography
          variant="caption"
          sx={{ display: "block", color: "text.disabled" }}
        >
          {t("sidebar.update.checking")}
        </Typography>
      )}

      {status.state === "available" && (
        <Button
          size="small"
          fullWidth
          variant="outlined"
          color="warning"
          startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
          onClick={download}
          sx={{ mt: 0.5, fontSize: 11, py: 0.25 }}
        >
          {t("sidebar.update.download", { version: status.version })}
        </Button>
      )}

      {status.state === "downloading" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            mt: 0.5,
          }}
        >
          <CircularProgress
            size={12}
            variant="determinate"
            value={status.percent}
          />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {t("sidebar.update.downloading", { percent: status.percent })}
          </Typography>
        </Box>
      )}

      {status.state === "downloaded" && (
        <Tooltip title={t("sidebar.update.installHint")}>
          <Button
            size="small"
            fullWidth
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
            onClick={install}
            sx={{ mt: 0.5, fontSize: 11, py: 0.25 }}
          >
            {t("sidebar.update.install", { version: status.version })}
          </Button>
        </Tooltip>
      )}

      {status.state === "error" && (
        <Tooltip title={status.message}>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "error.main" }}
          >
            {t("sidebar.update.error")}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
}
