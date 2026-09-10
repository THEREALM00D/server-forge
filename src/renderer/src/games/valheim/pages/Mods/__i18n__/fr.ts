export default {
  valheimMods: {
    title: "Mods",
    subtitle: "Gérez les mods de votre serveur Valheim via Thunderstore",
    tabs: {
      installed: "Installés",
      browse: "Parcourir",
    },
    bepinex: {
      warning:
        "BepInEx non détecté dans le dossier serveur. La plupart des mods Valheim nécessitent BepInEx pour fonctionner.",
      ok: "BepInEx détecté",
      install: "Installer BepInEx",
      installing: "Installation…",
      success: "BepInEx installé avec succès",
    },
    installed: {
      empty:
        "Aucun mod installé. Parcourez Thunderstore ou importez un profil r2modman.",
      remove: "Désinstaller",
      removeConfirm: "Désinstaller {{name}} ?",
      enabled: "Activé",
      disabled: "Désactivé",
      manual: "Manuel",
      installedAt: "Installé le {{date}}",
      version: "v{{version}}",
      loadFailed: "Impossible de charger les mods installés",
    },
    thunderstore: {
      title: "Code Thunderstore",
      label: "Code de package",
      helper:
        "Format : Auteur-NomDuMod-Version (ex : denikson-BepInExPack_Valheim-5.4.2202)",
      importProfile: "Importer un profil",
      profileLabel: "Code de profil",
      profileHelper:
        "Collez le code exporté depuis Thunderstore ou r2modman (Paramètres → Exporter le profil → Copier le code)",
      importProfileFile: "Importer depuis un fichier (.r2z)",
      install: "Installer",
      success: "{{name}} installé depuis Thunderstore",
      profileSuccess: "{{count}} mod(s) installé(s) depuis le profil",
      profileErrors: "{{count}} mod(s) en erreur — voir les notifications",
    },
    browse: {
      tabs: {
        trending: "Tendances",
        latest: "Nouveaux",
        updated: "Mis à jour",
      },
      search: "Rechercher sur Thunderstore…",
      searchBtn: "Rechercher",
      clearSearch: "Effacer",
      installLatest: "Installer la dernière version",
      openOnThunderstore: "Ouvrir sur Thunderstore",
      openTooltip: "Ouvre la page du mod sur Thunderstore",
      viewFiles: "Versions",
      filesDialog: {
        title: "Versions de {{name}}",
        close: "Fermer",
        size: "{{size}} Ko",
        noFiles: "Aucune version disponible",
      },
      endorsements: "{{count}} étoiles",
      loading: "Chargement…",
      error: "Impossible de charger les mods Thunderstore",
    },
    folders: {
      plugins: "Dossier des mods",
      config: "Config des mods",
    },
    nxm: {
      installing: "Installation en cours…",
      success: "{{name}} installé avec succès",
      error: "Erreur d'installation : {{error}}",
    },
    deps: {
      title: "Dépendances requises",
      subtitle:
        "{{name}} nécessite {{count}} mod(s) non installé(s). Voulez-vous les installer ?",
      installAll: "Tout installer ({{count}})",
      skip: "Ignorer",
    },
    updates: {
      newVersion: "v{{version}} dispo",
      updateBtn: "Mettre à jour vers v{{version}}",
      refresh: "Vérifier les mises à jour",
    },
  },
};
