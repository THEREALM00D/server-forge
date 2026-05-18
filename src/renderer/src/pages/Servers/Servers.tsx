import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useTranslation } from "react-i18next";
import type { Server } from "@shared/types";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import ServerDialog, { type ServerFormValues } from "./components/ServerDialog";

export default function Servers() {
  const { t } = useTranslation();
  const { state, refreshServers, switchActive } = useServer();
  const { notify } = useNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Server | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (server: Server) => {
    setEditing(server);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ServerFormValues) => {
    if (editing) {
      await window.api.servers.update(editing.id, values);
      notify(t("servers.notify.updated", { name: values.name }), "success");
    } else {
      const created = await window.api.servers.create(values);
      notify(t("servers.notify.created", { name: created.name }), "success");
    }
    await refreshServers();
    setDialogOpen(false);
  };

  const handleDelete = async (server: Server) => {
    if (
      !window.confirm(t("servers.actions.deleteConfirm", { name: server.name }))
    )
      return;
    await window.api.servers.delete(server.id);
    notify(t("servers.notify.deleted"), "success");
    await refreshServers();
  };

  const handleActivate = async (server: Server) => {
    await switchActive(server.id);
    notify(t("servers.notify.activated", { name: server.name }), "success");
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6">{t("servers.title")}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("servers.subtitle")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          {t("servers.addServer")}
        </Button>
      </Box>

      <Paper sx={{ overflow: "hidden" }}>
        {state.servers.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("servers.empty")}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t("servers.columns.name")}</TableCell>
                  <TableCell>{t("servers.columns.game")}</TableCell>
                  <TableCell>{t("servers.columns.path")}</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {state.servers.map((srv) => {
                  const isActive = srv.id === state.activeServerId;
                  return (
                    <TableRow key={srv.id} hover selected={isActive}>
                      <TableCell sx={{ width: 50 }}>
                        <Tooltip
                          title={
                            isActive
                              ? t("servers.active")
                              : t("servers.actions.activate")
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => !isActive && handleActivate(srv)}
                            color={isActive ? "success" : "default"}
                          >
                            {isActive ? (
                              <CheckCircleIcon fontSize="small" />
                            ) : (
                              <RadioButtonUncheckedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: srv.color ?? "#64748b",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: isActive ? 600 : 400 }}
                          >
                            {srv.name}
                          </Typography>
                          {isActive && (
                            <Chip
                              label={t("servers.active")}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {t(`servers.games.${srv.gameType}`)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: "text.secondary",
                          }}
                        >
                          {srv.path}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title={t("servers.actions.edit")}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(srv)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("servers.actions.delete")}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(srv)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <ServerDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
