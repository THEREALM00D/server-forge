import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import type { PalPlayer } from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";

interface Props {
  players: PalPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<PalPlayer[]>>;
}

export default function PlayersPanel({ players, setPlayers }: Props) {
  const { notify } = useNotification();
  const [unbanId, setUnbanId] = useState("");

  const handleKick = async (player: PalPlayer) => {
    try {
      await window.api.palapi.kick(player.userId);
      notify(`${player.name} expulsé`, "success");
      setPlayers((prev) => prev.filter((p) => p.userId !== player.userId));
    } catch {
      notify(`Impossible d'expulser ${player.name}`);
    }
  };

  const handleBan = async (player: PalPlayer) => {
    try {
      await window.api.palapi.ban(player.userId);
      notify(`${player.name} banni`, "success");
      setPlayers((prev) => prev.filter((p) => p.userId !== player.userId));
    } catch {
      notify(`Impossible de bannir ${player.name}`);
    }
  };

  const handleUnban = async () => {
    const id = unbanId.trim();
    if (!id) return;
    try {
      await window.api.palapi.unban(id);
      notify(`Joueur ${id} débanni`, "success");
      setUnbanId("");
    } catch {
      notify(`Impossible de débannir ${id}`);
    }
  };

  return (
    <Paper sx={{ p: 2.5, flex: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Joueurs connectés ({players.length})
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {players.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Aucun joueur connecté
        </Typography>
      ) : (
        <Stack spacing={1}>
          {players.map((p) => (
            <Box
              key={p.userId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {p.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Niv. {p.level}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <Chip
                  label={`${p.ping.toFixed(0)} ms`}
                  size="small"
                  variant="outlined"
                />
                <Tooltip title="Expulser">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleKick(p)}
                  >
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bannir">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleBan(p)}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Débannir un joueur
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          placeholder="User ID"
          value={unbanId}
          onChange={(e) => setUnbanId(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          size="small"
          disabled={!unbanId.trim()}
          onClick={handleUnban}
        >
          Débannir
        </Button>
      </Stack>
    </Paper>
  );
}
