export default {
  servers: {
    title: "Serveurs",
    subtitle:
      "Liste de tous vos serveurs dédiés. Cliquez sur un serveur pour le sélectionner comme actif.",
    empty:
      "Aucun serveur configuré. Ajoutez votre premier serveur pour commencer.",
    active: "Actif",
    addServer: "Ajouter un serveur",
    columns: {
      name: "Nom",
      game: "Jeu",
      path: "Chemin",
      actions: "",
    },
    games: {
      palworld: "Palworld",
    },
    actions: {
      activate: "Activer",
      edit: "Modifier",
      delete: "Supprimer",
      deleteConfirm:
        "Supprimer le serveur « {{name}} » ? Les fichiers du jeu restent intacts, seules les configurations ServerForge sont effacées.",
    },
    dialog: {
      addTitle: "Nouveau serveur",
      editTitle: "Modifier le serveur",
      name: "Nom",
      nameHelper: "Ex. : FREEPORT, PvE Casual, Test",
      path: "Dossier du serveur",
      pathHelper:
        "Dossier contenant PalServer.exe (ex : E:\\Server\\Palworld_Freeport)",
      pathBrowse: "Parcourir",
      gameType: "Jeu",
      color: "Couleur",
      save: "Enregistrer",
      cancel: "Annuler",
    },
    notify: {
      created: "Serveur « {{name}} » ajouté.",
      updated: "Serveur « {{name}} » modifié.",
      deleted: "Serveur supprimé.",
      activated: "« {{name}} » est maintenant le serveur actif.",
      pathRequired: "Le chemin du serveur est obligatoire.",
      nameRequired: "Le nom du serveur est obligatoire.",
    },
  },
};
