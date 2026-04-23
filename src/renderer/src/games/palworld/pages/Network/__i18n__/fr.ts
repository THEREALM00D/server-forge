export default {
  network: {
    title: "Réseau & Pare-feu",
    subtitle:
      "Gestion des règles Windows Defender Firewall pour le serveur Palworld",
    admin: {
      title: "Privilèges administrateur",
      subtitle: "Requis pour modifier les règles de pare-feu",
      isAdmin: "Administrateur",
      notAdmin: "Non-administrateur",
      warning:
        "Relancez l'application en tant qu'administrateur pour modifier les règles de pare-feu.",
    },
    standard: {
      title: "Règles pare-feu",
      applyAll: "Tout appliquer",
      applyAllTooltip:
        "Relire les ports depuis PalWorldSettings.ini et créer toutes les règles",
      removeAll: "Tout supprimer",
      removeAllTooltip: "Supprimer toutes les règles Palworld du pare-feu",
      colRule: "Règle",
      colPort: "Port",
      colProto: "Proto",
      colState: "État",
      enable: "Activer",
      disable: "Désactiver",
      active: "Active",
      inactive: "Inactive",
      ruleAdded: 'Règle "{{name}}" ajoutée',
      ruleRemoved: 'Règle "{{name}}" supprimée',
      allApplied: "Toutes les règles ont été appliquées",
      allRemoved: "Toutes les règles Palworld ont été supprimées",
    },
    custom: {
      title: "Règles personnalisées",
      name: "Nom",
      port: "Port",
      proto: "Proto",
      create: "Créer",
      delete: "Supprimer",
      none: "Aucune règle personnalisée",
      invalidInput: "Nom et port valide (1-65535) requis",
      createErrorFallback: "Erreur lors de la création",
      deleteErrorFallback: "Erreur lors de la suppression",
      created: 'Règle "{{name}}" créée',
      deleted: 'Règle "{{name}}" supprimée',
    },
  },
};
