import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { serverService } from "../services/serverService";
import type { ServerStatus } from "../../../types";

export function useServerControls() {
  const { state, dispatch } = useServer();
  const { notify } = useNotification();

  const canStart = state.status === "stopped" || state.status === "crashed";
  const canStop = state.status === "running" || state.status === "starting";

  const optimistic = (status: ServerStatus) => {
    if (!state.activeServerId) return;
    dispatch({
      type: "SET_SERVER_STATUS",
      payload: { serverId: state.activeServerId, status },
    });
  };

  const start = async () => {
    optimistic("starting");
    const res = await serverService.start();
    if (!res.success) {
      notify(res.error ?? "Impossible de démarrer le serveur", "error");
      optimistic("stopped");
    }
  };

  const stop = async () => {
    optimistic("stopping");
    const res = await serverService.stop();
    if (!res.success)
      notify(res.error ?? "Impossible d'arrêter le serveur", "error");
  };

  const restart = async () => {
    optimistic("stopping");
    const res = await serverService.restart();
    if (!res.success)
      notify(res.error ?? "Impossible de redémarrer le serveur", "error");
  };

  return { start, stop, restart, canStart, canStop };
}
