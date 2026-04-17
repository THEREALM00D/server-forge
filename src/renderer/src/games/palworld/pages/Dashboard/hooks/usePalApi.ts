import { useEffect, useState } from "react";
import type {
  PalServerInfo,
  PalMetrics,
  PalPlayer,
  ServerStatus,
} from "@shared/types";

export interface PalApiState {
  serverInfo: PalServerInfo | null;
  metrics: PalMetrics | null;
  players: PalPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<PalPlayer[]>>;
}

export function usePalApi(status: ServerStatus): PalApiState {
  const [serverInfo, setServerInfo] = useState<PalServerInfo | null>(null);
  const [metrics, setMetrics] = useState<PalMetrics | null>(null);
  const [players, setPlayers] = useState<PalPlayer[]>([]);

  useEffect(() => {
    if (status !== "running") {
      setServerInfo(null);
      setMetrics(null);
      setPlayers([]);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        const [info, m, p] = await Promise.all([
          window.api.palapi.getInfo(),
          window.api.palapi.getMetrics(),
          window.api.palapi.getPlayers(),
        ]);
        if (!cancelled) {
          setServerInfo(info);
          setMetrics(m);
          setPlayers(p.players);
        }
      } catch {
        // API non disponible
      }
    };

    fetch();
    const interval = setInterval(fetch, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status]);

  return { serverInfo, metrics, players, setPlayers };
}
