import { useEffect, useState } from "react";

const REFRESH_INTERVAL_MS = 10_000;

/**
 * Nombre de joueurs en ligne d'après l'historique alimenté par Odin-Eye
 * (poll côté main toutes les 30s). Renvoie `null` si Odin-Eye n'est pas
 * configuré : l'appelant retombe alors sur le compteur issu des logs.
 */
export function useOdinEyeOnlineCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const cfg = await window.api.valheim.getConfig();
        if (!cfg.odinEyeUrl) {
          if (!cancelled) setCount(null);
          return;
        }
        const history = await window.api.players.getHistory();
        if (!cancelled) setCount(history.filter((e) => e.online).length);
      } catch {
        if (!cancelled) setCount(null);
      }
    };

    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return count;
}
