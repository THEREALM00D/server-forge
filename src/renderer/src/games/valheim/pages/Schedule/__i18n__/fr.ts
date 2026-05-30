export default {
  schedule: {
    title: "Planification",
    subtitle: "Redémarrage automatique quotidien du serveur",
    enabled: "Activer le redémarrage planifié",
    time: "Heure (24h)",
    warning: "Avertissement (minutes avant)",
    warningHelper: "Délai entre l'annonce et l'arrêt (0 = immédiat)",
    message: "Message d'annonce",
    messageHelper: "{minutes} sera remplacé par le délai",
    save: "Enregistrer",
    notify: {
      saved: "Planification enregistrée",
    },
  },
  valheimSchedule: {
    noApiInfo:
      "Valheim ne dispose pas d'API REST — le redémarrage sera forcé (taskkill). Aucune annonce ni sauvegarde automatique n'est effectuée.",
  },
};
