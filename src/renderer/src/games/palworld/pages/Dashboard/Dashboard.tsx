import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../hooks/useServerControls";
import type { SystemStats } from "../../../../types";

const STATUS_COLOR: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  running: "success",
  starting: "warning",
  stopping: "warning",
  crashed: "error",
  stopped: "default",
};

const STATUS_LABEL: Record<string, string> = {
  running: "En ligne",
  starting: "Démarrage...",
  stopping: "Arrêt...",
  crashed: "Planté",
  stopped: "Arrêté",
};

function StatCard({
  label,
  value,
  unit,
  progress,
}: {
  label: string;
  value: string | number;
  unit?: string;
  progress?: number;
}) {
  const color =
    (progress ?? 0) > 85
      ? "error"
      : (progress ?? 0) > 65
        ? "warning"
        : "success";
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        {unit && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {unit}
          </Typography>
        )}
      </Box>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progress)}
          color={color}
          sx={{ mt: 1.5, height: 4, borderRadius: 2 }}
        />
      )}
    </Paper>
  );
}

function StatsGrid({ stats }: { stats: SystemStats }) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <StatCard label="CPU" value={stats.cpu} unit="%" progress={stats.cpu} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard label="RAM" value={stats.ram} unit="%" progress={stats.ram} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard label="RAM utilisée" value={stats.ramUsed} unit="GB" />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label="Uptime"
          value={Math.floor(stats.uptime / 60)}
          unit="min"
        />
      </Box>
    </Box>
  );
}

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

export default function Dashboard() {
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;

  const [serverInfo, setServerInfo] = useState<PalServerInfo | null>(null);
  const [metrics, setMetrics] = useState<PalMetrics | null>(null);

  useEffect(() => {
    if (status !== "running") {
      setServerInfo(null);
      setMetrics(null);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        const [info, m] = await Promise.all([
          window.api.palapi.getInfo(),
          window.api.palapi.getMetrics(),
        ]);
        if (!cancelled) {
          setServerInfo(info);
          setMetrics(m);
        }
      } catch {
        // API non disponible (REST désactivé ou serveur pas encore prêt)
      }
    };

    fetch();
    const interval = setInterval(fetch, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Dashboard</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {serverPath || "Aucun chemin serveur — configurez dans Installation"}
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Chip
          label={STATUS_LABEL[status] ?? status}
          color={STATUS_COLOR[status] ?? "default"}
          variant="outlined"
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            disabled={!canStart}
            onClick={start}
            size="small"
          >
            Démarrer
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon />}
            disabled={!canStop}
            onClick={restart}
            size="small"
          >
            Redémarrer
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            disabled={!canStop}
            onClick={stop}
            size="small"
          >
            Arrêter
          </Button>
        </Stack>
      </Paper>

      {stats ? (
        <StatsGrid stats={stats} />
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          En attente des statistiques système...
        </Typography>
      )}

      {serverInfo && (
        <Paper sx={{ p: 2.5 }}>
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
      )}
    </Stack>
  );
}
