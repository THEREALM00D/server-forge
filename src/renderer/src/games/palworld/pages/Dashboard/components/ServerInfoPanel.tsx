import { Box, Divider, Paper, Typography } from "@mui/material";
import type { PalServerInfo, PalMetrics } from "@shared/types";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          maxWidth: "60%",
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface Props {
  serverInfo: PalServerInfo;
  metrics: PalMetrics | null;
}

export default function ServerInfoPanel({ serverInfo, metrics }: Props) {
  return (
    <Paper sx={{ p: 2.5, flex: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Informations du serveur
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <InfoRow label="Nom" value={serverInfo.servername} />
      <InfoRow label="Version" value={serverInfo.version} />
      {serverInfo.description && (
        <InfoRow label="Description" value={serverInfo.description} />
      )}
      <InfoRow label="GUID" value={serverInfo.worldguid} />
      {metrics && (
        <>
          <Divider sx={{ my: 1 }} />
          <InfoRow
            label="Joueurs en ligne"
            value={`${metrics.currentplayernum} / ${metrics.maxplayernum}`}
          />
          <InfoRow label="Jour en jeu" value={metrics.days} />
          <InfoRow label="FPS serveur" value={metrics.serverfps} />
          <InfoRow label="Camps de base" value={metrics.basecampnum} />
        </>
      )}
    </Paper>
  );
}
