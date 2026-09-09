export default {
  players: {
    title: "Joueurs",
    subtitle:
      "Historique de connexion suivi automatiquement quand le serveur tourne (API REST requise)",
    search: "Rechercher un joueur ou un ID",
    none: "Aucun joueur dans l'historique. Le suivi démarre dès qu'un joueur se connecte.",
    noResults: "Aucun joueur ne correspond à « {{query}} ».",
    online: "En ligne",
    offline: "Hors ligne",
    summary: {
      total: "{{count}} joueur",
      total_other: "{{count}} joueurs",
      online: "{{count}} en ligne",
    },
    columns: {
      name: "Pseudo",
      status: "Statut",
      lastSeen: "Dernière connexion",
      playtime: "Temps de jeu total",
      sessions: "Sessions",
      ip: "Dernière IP",
      actions: "",
    },
    actions: {
      remove: "Retirer de l'historique",
      removeConfirm: "Retirer {{name}} de l'historique ?",
      clear: "Effacer tout l'historique",
      clearConfirm:
        "Effacer tout l'historique des joueurs ? Cette action est irréversible.",
    },
    notify: {
      cleared: "Historique effacé.",
      removed: "{{name}} retiré de l'historique.",
      cannotLoad: "Impossible de charger l'historique.",
      removeFailed: "Impossible de retirer {{name}}.",
      clearFailed: "Impossible d'effacer l'historique.",
    },
    detail: {
      firstSeen: "Première connexion",
      sessionCount: "Sessions",
      lastIp: "Dernière IP",
      recentSessions: "Sessions récentes",
      sessionDuration: "Durée",
      ongoing: "En cours",
    },
    duration: {
      seconds: "{{count}}s",
      minutes: "{{count}}m",
      hoursMinutes: "{{hours}}h {{minutes}}m",
      days: "{{days}}j {{hours}}h",
    },
    relative: {
      now: "à l'instant",
      minutes: "il y a {{count}} min",
      hours: "il y a {{count}} h",
      days: "il y a {{count}} j",
    },
  },
};
