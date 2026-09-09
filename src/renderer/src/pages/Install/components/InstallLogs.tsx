import { Box, Divider, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { RefObject } from "react";

export default function InstallLogs({
  logs,
  logsEndRef,
}: {
  logs: string[];
  logsEndRef: RefObject<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {t("install.progress")}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          height: 180,
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: 11,
          color: "text.secondary",
          lineHeight: 1.6,
        }}
      >
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={logsEndRef} />
      </Box>
    </Paper>
  );
}
