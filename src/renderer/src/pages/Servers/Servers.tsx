import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useServers } from "./hooks/useServers";
import ServersTable from "./components/ServersTable";
import ServerDialog from "./components/ServerDialog";

export default function Servers() {
  const { t } = useTranslation();
  const {
    state,
    dialogOpen,
    editing,
    openAdd,
    openEdit,
    closeDialog,
    handleSubmit,
    handleDelete,
    handleActivate,
    handleServerAction,
  } = useServers();

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

      <ServersTable
        servers={state.servers}
        statuses={state.statuses}
        activeServerId={state.activeServerId}
        onActivate={handleActivate}
        onStart={(srv) => handleServerAction("start", srv)}
        onStop={(srv) => handleServerAction("stop", srv)}
        onRestart={(srv) => handleServerAction("restart", srv)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ServerDialog
        open={dialogOpen}
        initial={editing}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
