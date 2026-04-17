import { Box, Stack, Typography } from "@mui/material";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../hooks/useServerControls";
import { usePalApi } from "./hooks/usePalApi";
import ServerControls from "./components/ServerControls";
import StatsGrid from "./components/StatsGrid";
import ServerInfoPanel from "./components/ServerInfoPanel";
import PlayersPanel from "./components/PlayersPanel";

export default function Dashboard() {
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;
  const { serverInfo, metrics, players, setPlayers } = usePalApi(status);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Dashboard</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {serverPath || "Aucun chemin serveur — configurez dans Installation"}
        </Typography>
      </Box>

      <ServerControls
        status={status}
        canStart={canStart}
        canStop={canStop}
        onStart={start}
        onStop={stop}
        onRestart={restart}
      />

      {stats ? (
        <StatsGrid stats={stats} />
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          En attente des statistiques système...
        </Typography>
      )}

      {serverInfo && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <ServerInfoPanel serverInfo={serverInfo} metrics={metrics} />
          <PlayersPanel players={players} setPlayers={setPlayers} />
        </Box>
      )}
    </Stack>
  );
}
