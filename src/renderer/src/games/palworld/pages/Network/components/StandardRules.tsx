import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import type { FirewallRuleStatus } from "@shared/types";
import { firewallService } from "../../../services/firewallService";
import { useNotification } from "../../../../../context/NotificationContext";
import RuleStatus from "./RuleStatus";
import { useState } from "react";

const RULE_KEYS: Record<string, "game" | "rcon" | "restapi"> = {
  "Palworld Server - Game": "game",
  "Palworld Server - RCON": "rcon",
  "Palworld Server - REST API": "restapi",
};

const HEAD_SX = {
  color: "text.secondary",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

interface Props {
  rules: FirewallRuleStatus[];
  loading: boolean;
  isAdmin: boolean | null;
  onRefresh: () => Promise<void>;
  getPorts: () => Promise<{
    gamePort: number;
    rconPort: number;
    restApiPort: number;
  }>;
}

export default function StandardRules({
  rules,
  loading,
  isAdmin,
  onRefresh,
  getPorts,
}: Props) {
  const { notify } = useNotification();
  const [busy, setBusy] = useState<string | null>(null);

  const handleToggle = async (rule: FirewallRuleStatus) => {
    const key = RULE_KEYS[rule.name];
    if (!key) return;
    setBusy(rule.name);
    if (rule.active) {
      const res = await firewallService.disableRule(key);
      if (!res.success) notify(res.error ?? "Erreur", "error");
      else notify(`Règle "${rule.name}" supprimée`, "success");
    } else {
      const res = await firewallService.enableRule(
        key,
        rule.port,
        rule.protocol,
      );
      if (!res.success) notify(res.error ?? "Erreur", "error");
      else notify(`Règle "${rule.name}" ajoutée`, "success");
    }
    await onRefresh();
    setBusy(null);
  };

  const handleApplyAll = async () => {
    setBusy("all");
    const { gamePort, rconPort, restApiPort } = await getPorts();
    const res = await firewallService.applyAll(gamePort, rconPort, restApiPort);
    if (!res.success) notify(res.errors.join("\n"), "error");
    else notify("Toutes les règles ont été appliquées", "success");
    await onRefresh();
    setBusy(null);
  };

  const handleRemoveAll = async () => {
    setBusy("all");
    await firewallService.removeAll();
    notify("Toutes les règles Palworld ont été supprimées", "info");
    await onRefresh();
    setBusy(null);
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "text.secondary",
          }}
        >
          Règles pare-feu
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Relire les ports depuis PalWorldSettings.ini et créer toutes les règles">
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={
                  busy === "all" ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <SyncIcon />
                  )
                }
                disabled={busy !== null || !isAdmin}
                onClick={handleApplyAll}
              >
                Tout appliquer
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Supprimer toutes les règles Palworld du pare-feu">
            <span>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                disabled={busy !== null || !isAdmin}
                onClick={handleRemoveAll}
              >
                Tout supprimer
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>Règle</TableCell>
              <TableCell sx={HEAD_SX}>Port</TableCell>
              <TableCell sx={HEAD_SX}>Proto</TableCell>
              <TableCell sx={HEAD_SX}>État</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow
                key={rule.name}
                sx={{ "&:last-child td": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2">{rule.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {rule.port}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.protocol}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10 }}
                  />
                </TableCell>
                <TableCell>
                  <RuleStatus active={rule.active} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={rule.active ? "outlined" : "contained"}
                    color={rule.active ? "error" : "success"}
                    disabled={busy !== null || !isAdmin}
                    onClick={() => handleToggle(rule)}
                    sx={{ minWidth: 90 }}
                  >
                    {busy === rule.name ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : rule.active ? (
                      "Désactiver"
                    ) : (
                      "Activer"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
