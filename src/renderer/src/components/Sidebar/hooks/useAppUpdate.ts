import { useEffect, useState } from "react";
import type { AppUpdateStatus } from "@shared/types";

export interface AppUpdateState {
  currentVersion: string;
  status: AppUpdateStatus;
}

/**
 * Suit le statut de l'auto-updater (electron-updater) : vérification faite
 * automatiquement au démarrage par le main process, téléchargement et
 * installation restent déclenchés depuis l'UI.
 */
export function useAppUpdate() {
  const [state, setState] = useState<AppUpdateState>({
    currentVersion: "",
    status: { state: "idle" },
  });

  useEffect(() => {
    window.api.update.getCurrentVersion().then((currentVersion) => {
      setState((s) => ({ ...s, currentVersion }));
    });
    return window.api.update.onStatus((status) => {
      setState((s) => ({ ...s, status }));
    });
  }, []);

  return {
    ...state,
    check: () => window.api.update.check(),
    download: () => window.api.update.download(),
    install: () => window.api.update.install(),
  };
}
