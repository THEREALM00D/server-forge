export default {
  schedule: {
    title: "Planification",
    subtitle: "Redémarrage automatique quotidien du serveur",
    apiWarning:
      "L'API REST est désactivée — sans elle, le redémarrage planifié ne pourra pas sauvegarder le monde avant l'arrêt.",
    enableApi: "Activer",
    enabled: "Activer le redémarrage planifié",
    time: "Heure (24h)",
    warning: "Avertissement (minutes avant)",
    warningHelper: "Délai entre l'annonce et l'arrêt (0 = immédiat)",
    message: "Message d'annonce",
    messageHelper: "{minutes} sera remplacé par le délai",
    save: "Enregistrer",
    notify: {
      apiEnabled: "API REST activée. Redémarrez le serveur.",
      apiEnableFailed: "Échec de l'activation",
      apiCannotWrite: "Impossible de modifier la configuration",
      saved: "Planification enregistrée",
    },
  },
};
