import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import type { NexusModInfo, ValheimMod } from "@shared/types";

type BrowseTab = "trending" | "latest" | "updated";

interface ApiKeyState {
  value: string;
  username: string | null;
  isPremium: boolean;
  validating: boolean;
}

export function useValheimMods() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const locale = i18n.resolvedLanguage ?? "fr";

  const [apiKey, setApiKeyState] = useState<ApiKeyState>({
    value: "",
    username: null,
    isPremium: false,
    validating: false,
  });
  const [bepInEx, setBepInEx] = useState<boolean | null>(null);
  const [installedMods, setInstalledMods] = useState<ValheimMod[]>([]);
  const [browseTab, setBrowseTab] = useState<BrowseTab>("trending");
  const [browseMods, setBrowseMods] = useState<NexusModInfo[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Chargement initial
  useEffect(() => {
    window.api.valheim.mods.getApiKey().then((key) => {
      if (key) setApiKeyState((p) => ({ ...p, value: key }));
    });
    window.api.valheim.mods
      .detectBepInEx()
      .then(setBepInEx)
      .catch(() => setBepInEx(false));
    window.api.valheim.mods
      .list()
      .then(setInstalledMods)
      .catch(() => {});
  }, []);

  // Écouter les installations nxm:// déclenchées depuis le navigateur
  useEffect(() => {
    const unsub = window.api.valheim.mods.onNxmInstall(async (url) => {
      notify(t("valheimMods.nxm.installing"), "info");
      setInstalling(true);
      try {
        const mod = await window.api.valheim.mods.installFromNxm(url);
        setInstalledMods((prev) => [
          ...prev.filter((m) => m.modId !== mod.modId),
          mod,
        ]);
        notify(t("valheimMods.nxm.success", { name: mod.name }), "success");
      } catch (e) {
        notify(
          t("valheimMods.nxm.error", { error: (e as Error).message }),
          "error",
        );
      } finally {
        setInstalling(false);
      }
    });
    return unsub;
  }, [notify, t]);

  // Charger les mods selon l'onglet parcourir
  const loadBrowse = useCallback(async (tab: BrowseTab, hasKey: boolean) => {
    setBrowseLoading(true);
    setBrowseError(false);
    try {
      let mods: NexusModInfo[];
      if (tab === "trending") {
        // v3 public (top 5, sans clé) ou v1 complet (avec clé)
        mods = hasKey
          ? await window.api.valheim.mods.getTrending()
          : await window.api.valheim.mods.getTrendingPublic();
      } else if (tab === "latest") {
        mods = await window.api.valheim.mods.getLatestAdded();
      } else {
        mods = await window.api.valheim.mods.getLatestUpdated();
      }
      setBrowseMods(mods);
    } catch {
      setBrowseError(true);
      setBrowseMods([]);
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  const handleTabChange = useCallback(
    (tab: BrowseTab) => {
      setBrowseTab(tab);
      loadBrowse(tab, !!apiKey.username);
    },
    [loadBrowse, apiKey.username],
  );

  // Trending public au démarrage sans clé, complet avec clé
  useEffect(() => {
    loadBrowse("trending", !!apiKey.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValidateKey = useCallback(
    async (key: string) => {
      setApiKeyState((p) => ({ ...p, validating: true }));
      try {
        const user = await window.api.valheim.mods.validateKey(key);
        await window.api.valheim.mods.setApiKey(key);
        setApiKeyState({
          value: key,
          username: user.username,
          isPremium: user.is_premium,
          validating: false,
        });
        notify(t("valheimMods.apiKey.saved"), "success");
        loadBrowse("trending", true);
      } catch {
        setApiKeyState((p) => ({ ...p, validating: false }));
        notify(t("valheimMods.apiKey.invalid"), "error");
      }
    },
    [notify, t, loadBrowse],
  );

  const handleRemoveMod = useCallback(
    async (modId: number, name: string) => {
      if (!window.confirm(t("valheimMods.installed.removeConfirm", { name })))
        return;
      try {
        await window.api.valheim.mods.remove(modId);
        setInstalledMods((prev) => prev.filter((m) => m.modId !== modId));
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify, t],
  );

  const handleToggleMod = useCallback(
    async (modId: number, enabled: boolean) => {
      try {
        await window.api.valheim.mods.toggle(modId, enabled);
        setInstalledMods((prev) =>
          prev.map((m) => (m.modId === modId ? { ...m, enabled } : m)),
        );
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify],
  );

  return {
    apiKey,
    bepInEx,
    installedMods,
    browseTab,
    browseMods,
    browseLoading,
    browseError,
    installing,
    locale,
    handleValidateKey,
    handleTabChange,
    handleRemoveMod,
    handleToggleMod,
  };
}
