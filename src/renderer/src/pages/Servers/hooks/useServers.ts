import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Server } from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { serverService } from "../../../games/palworld/services/serverService";
import type { ServerFormValues } from "../components/ServerDialog";

export function useServers() {
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

  const closeDialog = () => setDialogOpen(false);

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

  const handleServerAction = async (
    action: "start" | "stop" | "restart",
    server: Server,
  ) => {
    const res = await serverService[action](server.id);
    if (!res.success) {
      const key =
        action === "stop"
          ? "servers.notify.stopFailed"
          : "servers.notify.startFailed";
      notify(t(key, { error: res.error ?? "?" }), "error");
    }
  };

  return {
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
  };
}
