export default {
  valheimConfig: {
    title: "Configuration du serveur",
    subtitle: "Arguments de lancement de valheim_server.exe",
    openSaves: "Ouvrir le dossier de sauvegardes",
    save: "Sauvegarder",
    saved: "Sauvegardé !",
    noServerPath: "Configurez le chemin du serveur dans l'onglet Installation.",
    sections: {
      general: "Général",
      world: "Monde",
      network: "Réseau",
      advanced: "Avancé",
    },
    fields: {
      name: {
        label: "Nom du serveur",
        description: "Nom affiché dans la liste des serveurs Steam.",
      },
      world: {
        label: "Nom du monde",
        description: "Nom du fichier de monde (sans extension).",
      },
      password: {
        label: "Mot de passe",
        description:
          "Laissez vide pour un serveur sans mot de passe (min. 5 caractères si défini).",
      },
      port: {
        label: "Port",
        description:
          "Port de jeu UDP. Le port query est automatiquement port+1.",
      },
      public: {
        label: "Serveur public (Steam)",
        description:
          "Rend le serveur visible dans la liste communautaire Steam.",
      },
      savedir: {
        label: "Dossier de sauvegardes",
        description:
          "Chemin personnalisé pour les mondes. Vide = %APPDATA%\\Roaming\\Valheim.",
      },
      crossplay: {
        label: "Crossplay (Xbox)",
        description: "Active le crossplay entre PC et Xbox via le réseau Xbox.",
      },
      logFile: {
        label: "Fichier de log",
        description:
          "Chemin vers un fichier de log personnalisé. Vide = comportement par défaut.",
      },
      customArgs: {
        label: "Arguments supplémentaires",
        description: "Arguments additionnels ajoutés à la ligne de commande.",
      },
    },
  },
};
