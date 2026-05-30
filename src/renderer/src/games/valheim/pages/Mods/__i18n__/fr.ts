export default {
  valheimMods: {
    title: "Mods",
    subtitle: "Gérez les mods de votre serveur Valheim via NexusMods",
    tabs: {
      installed: "Installés",
      browse: "Parcourir",
    },
    apiKey: {
      title: "Connexion NexusMods",
      label: "Clé API",
      placeholder: "Votre clé API NexusMods",
      helper:
        "Générez une clé sur nexusmods.com → compte → Paramètres → Clés API",
      validate: "Valider",
      validating: "Vérification…",
      connected: "Connecté en tant que {{username}}",
      premium: "Premium",
      free: "Gratuit",
      invalid: "Clé API invalide",
      saved: "Clé API enregistrée",
    },
    bepinex: {
      warning:
        "BepInEx non détecté dans le dossier serveur. La plupart des mods Valheim nécessitent BepInEx pour fonctionner.",
      ok: "BepInEx détecté",
    },
    installed: {
      empty:
        "Aucun mod installé. Parcourez NexusMods pour trouver des mods, puis cliquez « Mod Manager Download » sur le site.",
      remove: "Désinstaller",
      removeConfirm: "Désinstaller {{name}} ?",
      enabled: "Activé",
      disabled: "Désactivé",
      installedAt: "Installé le {{date}}",
      version: "v{{version}}",
    },
    browse: {
      tabs: {
        trending: "Tendances",
        latest: "Nouveaux",
        updated: "Mis à jour",
      },
      openOnNexus: "Ouvrir sur NexusMods",
      openTooltip:
        "Ouvre la page du mod sur NexusMods. Cliquez ensuite « Mod Manager Download » pour l'installer.",
      viewFiles: "Fichiers",
      filesDialog: {
        title: "Fichiers de {{name}}",
        close: "Fermer",
        size: "{{size}} Ko",
        noFiles: "Aucun fichier disponible",
      },
      endorsements: "{{count}} endorsements",
      noApiKey: "Configurez votre clé API NexusMods pour parcourir les mods.",
      publicMode:
        "Mode public (top 5, sans clé API). Configurez votre clé pour voir plus de mods et activer les onglets Nouveaux et Mis à jour.",
      loading: "Chargement…",
      error: "Impossible de charger les mods",
    },
    nxm: {
      installing: "Installation depuis NexusMods…",
      success: "{{name}} installé avec succès",
      error: "Erreur d'installation : {{error}}",
    },
  },
};
