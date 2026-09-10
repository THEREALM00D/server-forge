import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import { useServer } from "../../../../../context/ServerContext";
import type { ThunderstoreModInfo, ValheimMod, ModUpdate } from "@shared/types";

type BrowseTab = "trending" | "latest" | "updated";

export function useValheimMods() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const locale = i18n.resolvedLanguage ?? "fr";

  // BepInEx ne scanne les plugins qu'au démarrage du process — un mod
  // activé/désactivé/supprimé pendant que le serveur tourne encore reste
  // chargé (ou absent) jusqu'au prochain redémarrage.
  const notifyRestartNeeded = useCallback(() => {
    if (state.status === "running") {
      notify(t("valheimMods.installed.restartRequired"), "info");
    }
  }, [notify, t, state.status]);

  const [bepInEx, setBepInEx] = useState<boolean | null>(null);
  const [installedMods, setInstalledMods] = useState<ValheimMod[]>([]);
  const [browseTab, setBrowseTab] = useState<BrowseTab>("trending");
  const [browseMods, setBrowseMods] = useState<ThunderstoreModInfo[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installingBepInEx, setInstallingBepInEx] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  // Dépendances manquantes après une installation
  const [pendingDeps, setPendingDeps] = useState<{
    modName: string;
    deps: ThunderstoreModInfo[];
  } | null>(null);

  // Mises à jour disponibles pour les mods installés
  const [updates, setUpdates] = useState<ModUpdate[]>([]);

  const getInstalledCodes = (mods: ValheimMod[]) =>
    mods.map((m) => m.thunderstoreCode).filter((c): c is string => Boolean(c));

  const refreshUpdates = useCallback(
    async (mods: ValheimMod[]) => {
      const codes = getInstalledCodes(mods);
      if (codes.length === 0) {
        setUpdates([]);
        return;
      }
      try {
        const found = await window.api.valheim.mods.checkUpdates(codes);
        setUpdates(found);
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify],
  );

  const loadBrowse = useCallback(async (tab: BrowseTab, searchQuery = "") => {
    setBrowseLoading(true);
    setBrowseError(false);
    try {
      let mods: ThunderstoreModInfo[];
      if (searchQuery.trim()) {
        mods = await window.api.valheim.mods.search(searchQuery.trim());
      } else if (tab === "trending") {
        mods = await window.api.valheim.mods.getTrending();
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

  // Chargement initial
  useEffect(() => {
    loadBrowse("trending");
    window.api.valheim.mods
      .detectBepInEx()
      .then(setBepInEx)
      .catch(() => setBepInEx(false));
    window.api.valheim.mods
      .list()
      .then((mods) => {
        setInstalledMods(mods);
        refreshUpdates(mods);
      })
      .catch(() => notify(t("valheimMods.installed.loadFailed"), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = useCallback(
    (tab: BrowseTab) => {
      setBrowseTab(tab);
      loadBrowse(tab);
    },
    [loadBrowse],
  );

  const handleSearch = useCallback(
    (query: string) => {
      loadBrowse(browseTab, query);
    },
    [loadBrowse, browseTab],
  );

  const handleInstallBepInEx = useCallback(async () => {
    setInstallingBepInEx(true);
    try {
      await window.api.valheim.mods.installBepInEx();
      const detected = await window.api.valheim.mods.detectBepInEx();
      setBepInEx(detected);
      notify(t("valheimMods.bepinex.success"), "success");
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setInstallingBepInEx(false);
    }
  }, [notify, t]);

  // Vérifie les dépendances manquantes après une installation
  const checkDepsAfterInstall = useCallback(
    async (code: string, currentMods: ValheimMod[], modName: string) => {
      const parts = code.split("-");
      if (parts.length < 3) return;
      const name = parts[parts.length - 2];
      const namespace = parts.slice(0, parts.length - 2).join("-");
      const installedCodes = getInstalledCodes(currentMods);
      try {
        const deps = await window.api.valheim.mods.getMissingDeps(
          namespace,
          name,
          installedCodes,
        );
        if (deps.length > 0) setPendingDeps({ modName, deps });
      } catch (e) {
        notify((e as Error).message, "warning");
      }
    },
    [notify],
  );

  const handleInstallFromThunderstore = useCallback(
    async (code: string) => {
      setInstalling(true);
      try {
        const mod = await window.api.valheim.mods.installFromThunderstore(code);
        setInstalledMods((prev) => {
          const next = [
            ...prev.filter(
              (m) =>
                m.thunderstoreCode !== code && m.installDir !== mod.installDir,
            ),
            mod,
          ];
          refreshUpdates(next);
          checkDepsAfterInstall(code, next, mod.name);
          return next;
        });
        notify(
          t("valheimMods.thunderstore.success", { name: mod.name }),
          "success",
        );
      } catch (e) {
        notify((e as Error).message, "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates, checkDepsAfterInstall],
  );

  const handleInstallImportProfile = useCallback(
    async (base64Code: string) => {
      setInstalling(true);
      try {
        const { installed, errors } =
          await window.api.valheim.mods.importProfile(base64Code);
        const fresh = await window.api.valheim.mods.list();
        setInstalledMods(fresh);
        refreshUpdates(fresh);
        if (installed.length > 0)
          notify(
            t("valheimMods.thunderstore.profileSuccess", {
              count: installed.length,
            }),
            "success",
          );
        if (errors.length > 0)
          notify(
            t("valheimMods.thunderstore.profileErrors", {
              count: errors.length,
            }),
            "warning",
          );
      } catch (e) {
        notify((e as Error).message, "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates],
  );

  const handleImportProfileFile = useCallback(
    async (filePath: string) => {
      setInstalling(true);
      try {
        const { installed, errors } =
          await window.api.valheim.mods.importProfileFile(filePath);
        const fresh = await window.api.valheim.mods.list();
        setInstalledMods(fresh);
        refreshUpdates(fresh);
        if (installed.length > 0)
          notify(
            t("valheimMods.thunderstore.profileSuccess", {
              count: installed.length,
            }),
            "success",
          );
        if (errors.length > 0)
          notify(
            t("valheimMods.thunderstore.profileErrors", {
              count: errors.length,
            }),
            "warning",
          );
      } catch (e) {
        notify((e as Error).message, "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates],
  );

  const handleRemoveMod = useCallback(
    async (modId: number, name: string) => {
      if (!window.confirm(t("valheimMods.installed.removeConfirm", { name })))
        return;
      try {
        await window.api.valheim.mods.remove(modId);
        setInstalledMods((prev) => {
          const next = prev.filter((m) => m.modId !== modId);
          refreshUpdates(next);
          return next;
        });
        notifyRestartNeeded();
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify, t, refreshUpdates, notifyRestartNeeded],
  );

  const handleToggleMod = useCallback(
    async (modId: number, enabled: boolean) => {
      try {
        await window.api.valheim.mods.toggle(modId, enabled);
        setInstalledMods((prev) =>
          prev.map((m) => (m.modId === modId ? { ...m, enabled } : m)),
        );
        notifyRestartNeeded();
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify, notifyRestartNeeded],
  );

  const handleRefreshUpdates = useCallback(async () => {
    setCheckingUpdates(true);
    try {
      const codes = getInstalledCodes(installedMods);
      const found =
        codes.length === 0
          ? []
          : await window.api.valheim.mods.checkUpdates(codes);
      setUpdates(found);
      notify(
        found.length > 0
          ? t("valheimMods.updates.found", { count: found.length })
          : t("valheimMods.updates.none"),
        found.length > 0 ? "info" : "success",
      );
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setCheckingUpdates(false);
    }
  }, [notify, t, installedMods]);

  const handleInstallAllDeps = useCallback(async () => {
    if (!pendingDeps) return;
    const deps = pendingDeps.deps;
    setPendingDeps(null);
    for (const dep of deps) {
      await handleInstallFromThunderstore(
        `${dep.author}-${dep.name}-${dep.version}`,
      );
    }
  }, [pendingDeps, handleInstallFromThunderstore]);

  return {
    bepInEx,
    installedMods,
    browseTab,
    browseMods,
    browseLoading,
    browseError,
    installing,
    installingBepInEx,
    checkingUpdates,
    locale,
    pendingDeps,
    updates,
    handleTabChange,
    handleSearch,
    handleRemoveMod,
    handleToggleMod,
    handleInstallBepInEx,
    handleInstallFromThunderstore,
    handleImportProfile: handleInstallImportProfile,
    handleImportProfileFile,
    handleRefreshUpdates,
    handleInstallAllDeps,
    handleDismissDeps: () => setPendingDeps(null),
  };
}
