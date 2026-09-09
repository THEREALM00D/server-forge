import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";
import type { ValheimJoinInfo } from "../hooks/useValheimJoinInfo";
import { useNotification } from "../../../../../context/NotificationContext";

function CopyableValue({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const { notify } = useNotification();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      notify(t("valheimDashboard.joinInfo.copied"), "success");
    } catch {
      // ignore — API clipboard indisponible
    }
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{ fontFamily: "monospace", letterSpacing: 1 }}
        >
          {value}
        </Typography>
        <Tooltip title={t("valheimDashboard.joinInfo.copy")}>
          <IconButton size="small" onClick={copy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default function JoinInfoCard({ info }: { info: ValheimJoinInfo }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t("valheimDashboard.joinInfo.title")}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 4 }}>
        <CopyableValue
          label={t("valheimDashboard.joinInfo.code")}
          value={info.joinCode}
        />
        <CopyableValue
          label={t("valheimDashboard.joinInfo.ip")}
          value={info.ip}
        />
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("valheimDashboard.joinInfo.players")}
          </Typography>
          <Typography variant="h6">{info.playerCount}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
