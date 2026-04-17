import { useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { FirewallRuleStatus } from "@shared/types";
import { firewallService } from "../../../services/firewallService";
import { useNotification } from "../../../../../context/NotificationContext";
import RuleStatus from "./RuleStatus";

const HEAD_SX = {
  color: "text.secondary",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

interface Props {
  rules: FirewallRuleStatus[];
  isAdmin: boolean | null;
  onRefresh: () => Promise<void>;
}

export default function CustomRules({ rules, isAdmin, onRefresh }: Props) {
  const { notify } = useNotification();
  const [newName, setNewName] = useState("");
  const [newPort, setNewPort] = useState("");
  const [newProtocol, setNewProtocol] = useState<"TCP" | "UDP">("UDP");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    const port = parseInt(newPort, 10);
    if (!newName.trim() || isNaN(port) || port < 1 || port > 65535) {
      notify("Nom et port valide (1-65535) requis", "warning");
      return;
    }
    setCreating(true);
    const res = await firewallService.createCustomRule(
      newName.trim(),
      port,
      newProtocol,
    );
    if (!res.success) {
      notify(res.error ?? "Erreur lors de la création", "error");
    } else {
      notify(`Règle "${newName.trim()}" créée`, "success");
      setNewName("");
      setNewPort("");
      await onRefresh();
    }
    setCreating(false);
  };

  const handleDelete = async (rule: FirewallRuleStatus) => {
    setDeleting(`${rule.name}-${rule.protocol}`);
    const res = await firewallService.deleteCustomRule(
      rule.name,
      rule.protocol,
    );
    if (!res.success)
      notify(res.error ?? "Erreur lors de la suppression", "error");
    else notify(`Règle "${rule.name}" supprimée`, "success");
    await onRefresh();
    setDeleting(null);
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: "text.secondary",
          mb: 2,
        }}
      >
        Règles personnalisées
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start", mb: 2 }}
      >
        <TextField
          label="Nom"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={!isAdmin || creating}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Port"
          size="small"
          value={newPort}
          onChange={(e) => setNewPort(e.target.value.replace(/\D/g, ""))}
          disabled={!isAdmin || creating}
          slotProps={{ htmlInput: { maxLength: 5 } }}
          sx={{ flex: 1 }}
        />
        <FormControl
          size="small"
          sx={{ minWidth: 90 }}
          disabled={!isAdmin || creating}
        >
          <InputLabel>Proto</InputLabel>
          <Select
            label="Proto"
            value={newProtocol}
            onChange={(e) => setNewProtocol(e.target.value as "TCP" | "UDP")}
          >
            <MenuItem value="UDP">UDP</MenuItem>
            <MenuItem value="TCP">TCP</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          startIcon={
            creating ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          disabled={!isAdmin || creating || !newName.trim() || !newPort}
          onClick={handleCreate}
          sx={{ height: 40 }}
        >
          Créer
        </Button>
      </Stack>

      {rules.length > 0 ? (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={HEAD_SX}>Nom</TableCell>
                <TableCell sx={HEAD_SX}>Port</TableCell>
                <TableCell sx={HEAD_SX}>Proto</TableCell>
                <TableCell sx={HEAD_SX}>État</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={`${rule.name}-${rule.protocol}`}
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2">{rule.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
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
                    <Tooltip title="Supprimer">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!isAdmin || deleting !== null}
                          onClick={() => handleDelete(rule)}
                        >
                          {deleting === `${rule.name}-${rule.protocol}` ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          Aucune règle personnalisée
        </Typography>
      )}
    </Paper>
  );
}
