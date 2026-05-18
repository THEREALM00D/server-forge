import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import type { Server, ServerStatus, SystemStats } from "../types";
import { monitorService } from "../services/monitorService";
import { serverService } from "../games/palworld/services/serverService";

interface ServerState {
  servers: Server[];
  activeServerId: string | null;
  activeServer: Server | null;
  /** Legacy compat : path du serveur actif (= activeServer?.path) */
  serverPath: string;
  status: ServerStatus;
  stats: SystemStats | null;
  logs: string[];
}

type Action =
  | { type: "SET_SERVERS"; payload: Server[] }
  | { type: "SET_ACTIVE"; payload: { id: string | null; servers?: Server[] } }
  | { type: "SET_STATUS"; payload: ServerStatus }
  | { type: "SET_STATS"; payload: SystemStats }
  | { type: "ADD_LOG"; payload: string }
  | { type: "CLEAR_LOGS" };

const initialState: ServerState = {
  servers: [],
  activeServerId: null,
  activeServer: null,
  serverPath: "",
  status: "stopped",
  stats: null,
  logs: [],
};

function resolveActive(
  servers: Server[],
  id: string | null,
): { activeServer: Server | null; serverPath: string } {
  const active = id ? (servers.find((s) => s.id === id) ?? null) : null;
  return { activeServer: active, serverPath: active?.path ?? "" };
}

function reducer(state: ServerState, action: Action): ServerState {
  switch (action.type) {
    case "SET_SERVERS": {
      const { activeServer, serverPath } = resolveActive(
        action.payload,
        state.activeServerId,
      );
      return { ...state, servers: action.payload, activeServer, serverPath };
    }
    case "SET_ACTIVE": {
      const servers = action.payload.servers ?? state.servers;
      const { activeServer, serverPath } = resolveActive(
        servers,
        action.payload.id,
      );
      // Changement de serveur : on flush logs + status pour ne pas afficher
      // des données stales de l'ancien serveur.
      return {
        ...state,
        servers,
        activeServerId: action.payload.id,
        activeServer,
        serverPath,
        status: "stopped",
        logs: [],
      };
    }
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "ADD_LOG":
      return { ...state, logs: [...state.logs.slice(-499), action.payload] };
    case "CLEAR_LOGS":
      return { ...state, logs: [] };
    default:
      return state;
  }
}

interface ServerContextValue {
  state: ServerState;
  dispatch: React.Dispatch<Action>;
  /** Recharge la liste de serveurs depuis le main process. */
  refreshServers: () => Promise<Server[]>;
  /** Bascule le serveur actif (côté main + côté state). */
  switchActive: (id: string | null) => Promise<void>;
}

const ServerContext = createContext<ServerContextValue | null>(null);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshServers = async (): Promise<Server[]> => {
    const list = await window.api.servers.list();
    const active = await window.api.servers.getActive();
    dispatch({
      type: "SET_ACTIVE",
      payload: { id: active?.id ?? null, servers: list },
    });
    return list;
  };

  const switchActive = async (id: string | null): Promise<void> => {
    await window.api.servers.setActive(id);
    const list = await window.api.servers.list();
    dispatch({ type: "SET_ACTIVE", payload: { id, servers: list } });
  };

  useEffect(() => {
    refreshServers();

    monitorService.startPolling();
    const stopMonitor = monitorService.onStats((stats) => {
      dispatch({ type: "SET_STATS", payload: stats });
    });

    const stopLogs = serverService.onLog((line) => {
      dispatch({ type: "ADD_LOG", payload: line });
    });

    const statusInterval = setInterval(async () => {
      const status = await serverService.getStatus();
      dispatch({ type: "SET_STATUS", payload: status });
    }, 3000);

    return () => {
      stopMonitor();
      stopLogs();
      clearInterval(statusInterval);
      monitorService.stopPolling();
    };
  }, []);

  return (
    <ServerContext.Provider
      value={{ state, dispatch, refreshServers, switchActive }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  const ctx = useContext(ServerContext);
  if (!ctx) throw new Error("useServer must be used within ServerProvider");
  return ctx;
}
