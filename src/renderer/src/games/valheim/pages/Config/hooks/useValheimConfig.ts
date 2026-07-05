import { useState, useEffect } from "react";
import { useNotification } from "../../../../../context/NotificationContext";
import type { ValheimLaunchConfig, ValheimModifiers } from "@shared/types";

const DEFAULT_MODIFIERS: ValheimModifiers = {
  combat: "",
  deathpenalty: "",
  resources: "",
  raids: "",
  portals: "",
};

const DEFAULT_CONFIG: ValheimLaunchConfig = {
  name: "Mon Serveur Valheim",
  world: "Dedicated",
  password: "",
  port: 2456,
  public: true,
  savedir: "",
  crossplay: false,
  logFile: "",
  customArgs: "",
  worldSeed: "",
  worldSize: "",
  modifiers: DEFAULT_MODIFIERS,
};

export function useValheimConfig() {
  const { notify } = useNotification();
  const [config, setConfig] = useState<ValheimLaunchConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.api.valheim
      .getConfig()
      .then((cfg) => setConfig({ ...DEFAULT_CONFIG, ...cfg }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (patch: Partial<ValheimLaunchConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      await window.api.valheim.setConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      notify("Impossible de sauvegarder la configuration", "error");
    }
  };

  return { config, loading, saved, handleChange, handleSave };
}
