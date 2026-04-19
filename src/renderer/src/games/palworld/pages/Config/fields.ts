export type Settings = Record<string, string | number | boolean>;

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  options?: SelectOption[];
  description?: string;
}

export interface FieldGroup {
  label: string;
  fields: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    label: "Serveur",
    fields: [
      {
        key: "ServerName",
        label: "Nom du serveur",
        type: "text",
        description: "Nom affiché dans la liste des serveurs communautaires.",
      },
      {
        key: "ServerDescription",
        label: "Description",
        type: "text",
        description:
          "Description courte affichée sous le nom du serveur dans la liste.",
      },
      {
        key: "PublicIP",
        label: "IP publique",
        type: "text",
        description:
          "IP publique annoncée aux clients. Laisser vide pour détection automatique.",
      },
      {
        key: "PublicPort",
        label: "Port public",
        type: "number",
        description: "Port UDP utilisé par les joueurs (défaut 8211).",
      },
      {
        key: "ServerPlayerMaxNum",
        label: "Joueurs max",
        type: "number",
        description:
          "Nombre maximum de joueurs simultanés sur le serveur (limite recommandée : 32).",
      },
      {
        key: "CoopPlayerMaxNum",
        label: "Joueurs coop max",
        type: "number",
        description:
          "Nombre max de joueurs en session coopérative hébergée (4 par défaut). Sans effet sur un serveur dédié.",
      },
      {
        key: "ServerPassword",
        label: "Mot de passe serveur",
        type: "text",
        description:
          "Mot de passe requis pour rejoindre. Laisser vide pour un serveur public.",
      },
      {
        key: "AdminPassword",
        label: "Mot de passe admin",
        type: "text",
        description:
          "Mot de passe administrateur (commandes de modération et REST API).",
      },
      {
        key: "Region",
        label: "Région",
        type: "text",
        description:
          "Code régional affiché dans la liste des serveurs (ex : EU, NA, AS).",
      },
    ],
  },
  {
    label: "RCON",
    fields: [
      {
        key: "RCONEnabled",
        label: "Activer RCON",
        type: "boolean",
        description:
          "Active le protocole RCON standard pour l'administration à distance.",
      },
      {
        key: "RCONPort",
        label: "Port RCON",
        type: "number",
        description: "Port TCP utilisé par RCON (défaut 25575).",
      },
    ],
  },
  {
    label: "REST API",
    fields: [
      {
        key: "RESTAPIEnabled",
        label: "Activer REST API",
        type: "boolean",
        description:
          "Active l'API REST officielle (requise pour les redémarrages planifiés gracieux et les commandes admin de ServerForge).",
      },
      {
        key: "RESTAPIPort",
        label: "Port REST API",
        type: "number",
        description: "Port HTTP de l'API REST (défaut 8212, local uniquement).",
      },
    ],
  },
  {
    label: "Sécurité / Auth",
    fields: [
      {
        key: "bUseAuth",
        label: "Authentification requise",
        type: "boolean",
        description:
          "Exige l'authentification Steam des joueurs. Désactiver augmente les risques de triche.",
      },
      {
        key: "BanListURL",
        label: "URL liste de bans",
        type: "text",
        description:
          "URL d'une liste de bans partagée récupérée au démarrage du serveur.",
      },
      {
        key: "CrossplayPlatforms",
        label: "Plateformes crossplay",
        type: "text",
        description:
          "Plateformes autorisées (Steam, Xbox, etc.). Format tableau : (Steam,Xbox,Unknown,PS5,Mac).",
      },
      {
        key: "bAllowClientMod",
        label: "Autoriser mods client",
        type: "boolean",
        description: "Autorise les clients utilisant des mods à se connecter.",
      },
    ],
  },
  {
    label: "Temps & Vitesse",
    fields: [
      {
        key: "DayTimeSpeedRate",
        label: "Vitesse journée",
        type: "number",
        description:
          "Multiplicateur de vitesse du temps pendant la journée (1.0 = normal, 0.5 = 2× plus lent).",
      },
      {
        key: "NightTimeSpeedRate",
        label: "Vitesse nuit",
        type: "number",
        description:
          "Multiplicateur de vitesse du temps pendant la nuit (1.0 = normal).",
      },
    ],
  },
  {
    label: "XP & Collecte",
    fields: [
      {
        key: "ExpRate",
        label: "Taux d'XP",
        type: "number",
        description:
          "Multiplicateur de l'expérience gagnée par les joueurs et les Pals.",
      },
      {
        key: "CollectionDropRate",
        label: "Taux de collecte",
        type: "number",
        description:
          "Multiplicateur de la quantité d'objets obtenue en récoltant (arbres, rochers, etc.).",
      },
      {
        key: "CollectionObjectHpRate",
        label: "HP objets collectables",
        type: "number",
        description:
          "Multiplicateur des PV des objets collectables (plus bas = récolte plus rapide).",
      },
      {
        key: "CollectionObjectRespawnSpeedRate",
        label: "Respawn objets collectables",
        type: "number",
        description:
          "Vitesse de réapparition des ressources. Plus bas = réapparition plus rapide.",
      },
      {
        key: "EnemyDropItemRate",
        label: "Drop ennemi",
        type: "number",
        description:
          "Multiplicateur des objets lâchés par les ennemis à leur mort.",
      },
    ],
  },
  {
    label: "Mécaniques Pal",
    fields: [
      {
        key: "PalCaptureRate",
        label: "Taux de capture Pal",
        type: "number",
        description:
          "Multiplicateur du taux de réussite de capture avec les Pal Spheres.",
      },
      {
        key: "PalSpawnNumRate",
        label: "Taux de spawn Pal",
        type: "number",
        description:
          "Multiplicateur du nombre de Pals générés dans le monde (densité).",
      },
      {
        key: "PalDamageRateAttack",
        label: "Dégâts Pal (attaque)",
        type: "number",
        description: "Multiplicateur des dégâts infligés par les Pals.",
      },
      {
        key: "PalDamageRateDefense",
        label: "Dégâts Pal (défense)",
        type: "number",
        description:
          "Multiplicateur des dégâts reçus par les Pals (plus bas = Pals plus résistants).",
      },
      {
        key: "PalStomachDecreaceRate",
        label: "Faim Pal",
        type: "number",
        description:
          "Vitesse à laquelle la faim des Pals diminue. Plus bas = ils mangent moins souvent.",
      },
      {
        key: "PalStaminaDecreaceRate",
        label: "Stamina Pal",
        type: "number",
        description: "Vitesse à laquelle l'endurance des Pals diminue.",
      },
      {
        key: "PalAutoHPRegeneRate",
        label: "Régén HP Pal",
        type: "number",
        description: "Vitesse de régénération naturelle des PV des Pals.",
      },
      {
        key: "PalAutoHpRegeneRateInSleep",
        label: "Régén HP Pal (sommeil)",
        type: "number",
        description:
          "Vitesse de régénération des PV des Pals pendant le sommeil.",
      },
      {
        key: "PalEggDefaultHatchingTime",
        label: "Temps d'éclosion (h)",
        type: "number",
        description:
          "Durée de base avant l'éclosion d'un œuf de Pal, en heures réelles.",
      },
      {
        key: "bPalLost",
        label: "Perte Pal à la mort",
        type: "boolean",
        description:
          "Si activé, les Pals actifs peuvent être perdus définitivement à leur mort.",
      },
    ],
  },
  {
    label: "Statistiques joueur",
    fields: [
      {
        key: "PlayerDamageRateAttack",
        label: "Dégâts joueur (attaque)",
        type: "number",
        description: "Multiplicateur des dégâts infligés par les joueurs.",
      },
      {
        key: "PlayerDamageRateDefense",
        label: "Dégâts joueur (défense)",
        type: "number",
        description:
          "Multiplicateur des dégâts reçus par les joueurs (plus bas = plus résistant).",
      },
      {
        key: "PlayerStomachDecreaceRate",
        label: "Faim joueur",
        type: "number",
        description: "Vitesse à laquelle la faim du joueur diminue.",
      },
      {
        key: "PlayerStaminaDecreaceRate",
        label: "Stamina joueur",
        type: "number",
        description: "Vitesse à laquelle l'endurance du joueur diminue.",
      },
      {
        key: "PlayerAutoHPRegeneRate",
        label: "Régén HP joueur",
        type: "number",
        description: "Vitesse de régénération automatique des PV du joueur.",
      },
      {
        key: "PlayerAutoHpRegeneRateInSleep",
        label: "Régén HP joueur (sommeil)",
        type: "number",
        description:
          "Vitesse de régénération des PV du joueur pendant le sommeil.",
      },
    ],
  },
  {
    label: "Points de statistiques",
    fields: [
      {
        key: "bAllowEnhanceStat_Attack",
        label: "Amélioration Attaque",
        type: "boolean",
        description:
          "Autorise l'investissement de points de stat dans l'attaque.",
      },
      {
        key: "bAllowEnhanceStat_Health",
        label: "Amélioration Santé",
        type: "boolean",
        description: "Autorise l'investissement de points dans les PV.",
      },
      {
        key: "bAllowEnhanceStat_Stamina",
        label: "Amélioration Endurance",
        type: "boolean",
        description: "Autorise l'investissement de points dans l'endurance.",
      },
      {
        key: "bAllowEnhanceStat_Weight",
        label: "Amélioration Poids",
        type: "boolean",
        description:
          "Autorise l'investissement de points dans la capacité de transport.",
      },
      {
        key: "bAllowEnhanceStat_WorkSpeed",
        label: "Amélioration Vitesse travail",
        type: "boolean",
        description:
          "Autorise l'investissement de points dans la vitesse de travail.",
      },
    ],
  },
  {
    label: "Constructions",
    fields: [
      {
        key: "BuildObjectDamageRate",
        label: "Dégâts aux constructions",
        type: "number",
        description:
          "Multiplicateur des dégâts infligés aux constructions des joueurs.",
      },
      {
        key: "BuildObjectDeteriorationDamageRate",
        label: "Détérioration constructions",
        type: "number",
        description:
          "Vitesse de dégradation naturelle des constructions. 0 = pas de décrépitude.",
      },
      {
        key: "BaseCampMaxNum",
        label: "Camps de base max",
        type: "number",
        description: "Nombre maximum total de camps de base sur le serveur.",
      },
      {
        key: "BaseCampWorkerMaxNum",
        label: "Travailleurs camp max",
        type: "number",
        description: "Nombre maximum de Pals assignés par camp (défaut 15).",
      },
      {
        key: "BaseCampMaxNumInGuild",
        label: "Camps max par guilde",
        type: "number",
        description:
          "Nombre maximum de camps qu'une même guilde peut posséder.",
      },
      {
        key: "MaxBuildingLimitNum",
        label: "Bâtiments max (0 = illimité)",
        type: "number",
        description:
          "Limite du nombre de bâtiments par zone. 0 désactive la limite.",
      },
      {
        key: "bBuildAreaLimit",
        label: "Limiter zone de construction",
        type: "boolean",
        description:
          "Restreint la construction à la zone du camp de base uniquement.",
      },
    ],
  },
  {
    label: "Objets & Équipement",
    fields: [
      {
        key: "WorkSpeedRate",
        label: "Vitesse de travail",
        type: "number",
        description:
          "Multiplicateur de la vitesse de travail des joueurs et Pals.",
      },
      {
        key: "DropItemMaxNum",
        label: "Objets au sol max",
        type: "number",
        description: "Nombre maximum d'objets lâchés au sol simultanément.",
      },
      {
        key: "DropItemAliveMaxHours",
        label: "Durée de vie objets au sol (h)",
        type: "number",
        description:
          "Durée avant la disparition automatique d'un objet au sol, en heures.",
      },
      {
        key: "EquipmentDurabilityDamageRate",
        label: "Dégâts durabilité équipement",
        type: "number",
        description:
          "Vitesse de dégradation de l'équipement à l'usage. 0 = indestructible.",
      },
      {
        key: "ItemWeightRate",
        label: "Poids des objets",
        type: "number",
        description:
          "Multiplicateur du poids des objets. Plus bas = inventaire plus léger.",
      },
      {
        key: "ItemCorruptionMultiplier",
        label: "Multiplicateur corruption",
        type: "number",
        description: "Multiplicateur de la corruption des objets périssables.",
      },
    ],
  },
  {
    label: "Mort & Pénalités",
    fields: [
      {
        key: "DeathPenalty",
        label: "Pénalité de mort",
        type: "select",
        description:
          "Ce qui est perdu à la mort du joueur : rien, objets du sac, +équipement, ou tout (sac + équipement + matériaux).",
        options: [
          { value: "None", label: "Aucune" },
          { value: "Item", label: "Objets" },
          { value: "ItemAndEquipment", label: "Objets + équipement" },
          { value: "All", label: "Tout" },
        ],
      },
      {
        key: "BlockRespawnTime",
        label: "Temps de blocage respawn",
        type: "number",
        description:
          "Durée minimum avant de pouvoir réapparaître après la mort (en secondes).",
      },
      {
        key: "RespawnPenaltyDurationThreshold",
        label: "Seuil durée pénalité respawn",
        type: "number",
        description:
          "Seuil de session active au-delà duquel la pénalité de respawn s'applique.",
      },
      {
        key: "RespawnPenaltyTimeScale",
        label: "Échelle temps pénalité respawn",
        type: "number",
        description:
          "Multiplicateur de la pénalité de temps de respawn après une mort.",
      },
    ],
  },
  {
    label: "Guilde",
    fields: [
      {
        key: "GuildPlayerMaxNum",
        label: "Membres guilde max",
        type: "number",
        description: "Nombre maximum de joueurs par guilde (défaut 20).",
      },
      {
        key: "GuildRejoinCooldownMinutes",
        label: "Délai rejoin guilde (min)",
        type: "number",
        description:
          "Temps d'attente avant de pouvoir rejoindre une guilde après l'avoir quittée.",
      },
      {
        key: "bAutoResetGuildNoOnlinePlayers",
        label: "Reset guilde si inactif",
        type: "boolean",
        description:
          "Réinitialise automatiquement les guildes dont aucun joueur ne se connecte pendant le délai configuré.",
      },
      {
        key: "AutoResetGuildTimeNoOnlinePlayers",
        label: "Délai reset guilde (h)",
        type: "number",
        description:
          "Délai d'inactivité (heures) avant reset automatique de la guilde.",
      },
    ],
  },
  {
    label: "PvP",
    fields: [
      {
        key: "bIsPvP",
        label: "PvP activé",
        type: "boolean",
        description: "Active le mode PvP général sur le serveur.",
      },
      {
        key: "bEnablePlayerToPlayerDamage",
        label: "Dégâts joueur → joueur",
        type: "boolean",
        description:
          "Autorise les dégâts entre joueurs (requis pour un vrai PvP).",
      },
      {
        key: "bEnableFriendlyFire",
        label: "Tir allié",
        type: "boolean",
        description: "Autorise les dégâts entre membres de la même guilde.",
      },
      {
        key: "bCanPickupOtherGuildDeathPenaltyDrop",
        label: "Ramasser drop mort guilde adverse",
        type: "boolean",
        description:
          "Permet de ramasser les objets lâchés à la mort par les joueurs d'une autre guilde.",
      },
      {
        key: "bAdditionalDropItemWhenPlayerKillingInPvPMode",
        label: "Drop extra en PvP",
        type: "boolean",
        description:
          "Ajoute des objets supplémentaires au drop lors d'une mise à mort en PvP.",
      },
      {
        key: "AdditionalDropItemNumWhenPlayerKillingInPvPMode",
        label: "Nb objets drop PvP",
        type: "number",
        description:
          "Quantité d'objets supplémentaires lâchés lors d'un kill PvP.",
      },
      {
        key: "AdditionalDropItemWhenPlayerKillingInPvPMode",
        label: "Objet drop PvP (ID)",
        type: "text",
        description:
          "ID de l'objet supplémentaire lâché à chaque kill PvP (laisser vide pour aléatoire).",
      },
      {
        key: "bEnableDefenseOtherGuildPlayer",
        label: "Défense joueur guilde adverse",
        type: "boolean",
        description:
          "Permet aux constructions défensives (tourelles) de cibler les joueurs d'autres guildes.",
      },
      {
        key: "bDisplayPvPItemNumOnWorldMap_Player",
        label: "Afficher items PvP carte (joueur)",
        type: "boolean",
        description:
          "Affiche sur la carte la position des sacs de mort PvP des joueurs.",
      },
      {
        key: "bDisplayPvPItemNumOnWorldMap_BaseCamp",
        label: "Afficher items PvP carte (camp)",
        type: "boolean",
        description:
          "Affiche sur la carte le pillage disponible dans les camps ennemis.",
      },
    ],
  },
  {
    label: "Gameplay",
    fields: [
      {
        key: "Difficulty",
        label: "Difficulté",
        type: "select",
        description:
          "Préréglage global de difficulté. Choisir « Personnalisé » pour conserver les valeurs individuelles.",
        options: [
          { value: "None", label: "Personnalisé" },
          { value: "Casual", label: "Casual" },
          { value: "Normal", label: "Normal" },
          { value: "Hard", label: "Difficile" },
        ],
      },
      {
        key: "bIsMultiplay",
        label: "Multijoueur",
        type: "boolean",
        description: "Marque la session comme multijoueur.",
      },
      {
        key: "bHardcore",
        label: "Mode Hardcore",
        type: "boolean",
        description:
          "Active le mode Hardcore (conséquences accrues à la mort).",
      },
      {
        key: "bCharacterRecreateInHardcore",
        label: "Recréer perso en Hardcore",
        type: "boolean",
        description:
          "Force la création d'un nouveau personnage après une mort en Hardcore.",
      },
      {
        key: "bEnableFastTravel",
        label: "Voyage rapide",
        type: "boolean",
        description:
          "Autorise le voyage rapide via les Pyramides et points d'intérêt.",
      },
      {
        key: "bEnableFastTravelOnlyBaseCamp",
        label: "Voyage rapide — camp seulement",
        type: "boolean",
        description:
          "Restreint le voyage rapide aux seuls camps de base du joueur.",
      },
      {
        key: "bIsStartLocationSelectByMap",
        label: "Choix spawn par carte",
        type: "boolean",
        description:
          "Permet au joueur de choisir son point de départ sur la carte.",
      },
      {
        key: "bExistPlayerAfterLogout",
        label: "Corps présent après déconnexion",
        type: "boolean",
        description:
          "Le personnage reste physiquement présent dans le monde après déconnexion (vulnérable).",
      },
      {
        key: "bEnableInvaderEnemy",
        label: "Ennemis envahisseurs",
        type: "boolean",
        description:
          "Active les raids ennemis qui attaquent les camps de base.",
      },
      {
        key: "bEnableNonLoginPenalty",
        label: "Pénalité déconnexion",
        type: "boolean",
        description:
          "Applique des pénalités aux joueurs ne se connectant pas régulièrement.",
      },
      {
        key: "bEnableAimAssistPad",
        label: "Aide visée manette",
        type: "boolean",
        description: "Active l'aide à la visée pour les joueurs à la manette.",
      },
      {
        key: "bEnableAimAssistKeyboard",
        label: "Aide visée clavier",
        type: "boolean",
        description:
          "Active l'aide à la visée pour les joueurs clavier/souris.",
      },
      {
        key: "bIsShowJoinLeftMessage",
        label: "Message connexion/déconnexion",
        type: "boolean",
        description:
          "Affiche un message in-game quand un joueur rejoint ou quitte.",
      },
      {
        key: "bShowPlayerList",
        label: "Afficher liste joueurs",
        type: "boolean",
        description: "Rend la liste des joueurs connectés visible en jeu.",
      },
      {
        key: "bIsUseBackupSaveData",
        label: "Sauvegarde backup",
        type: "boolean",
        description: "Active les sauvegardes de secours automatiques côté jeu.",
      },
      {
        key: "bAllowGlobalPalboxExport",
        label: "Export Palbox global",
        type: "boolean",
        description:
          "Autorise l'export de Pals hors du serveur (vers un autre monde).",
      },
      {
        key: "bAllowGlobalPalboxImport",
        label: "Import Palbox global",
        type: "boolean",
        description: "Autorise l'import de Pals venant d'un autre monde.",
      },
      {
        key: "bInvisibleOtherGuildBaseCampAreaFX",
        label: "Masquer zone camp guilde adverse",
        type: "boolean",
        description:
          "Masque visuellement la zone de construction des camps d'autres guildes.",
      },
      {
        key: "bActiveUNKO",
        label: "Activer UNKO",
        type: "boolean",
        description:
          "Active la mécanique UNKO (excréments des Pals, nécessaire pour certaines recettes).",
      },
      {
        key: "DenyTechnologyList",
        label: "Technologies interdites",
        type: "text",
        description:
          "Liste d'IDs de technologies interdites (séparés par des virgules).",
      },
    ],
  },
  {
    label: "Randomiseur",
    fields: [
      {
        key: "RandomizerType",
        label: "Type de randomiseur",
        type: "text",
        description:
          "Type de randomisation des Pals dans le monde (None, Region, All, etc.).",
      },
      {
        key: "RandomizerSeed",
        label: "Graine",
        type: "number",
        description:
          "Graine du randomiseur (même graine = mêmes résultats). 0 = aléatoire.",
      },
      {
        key: "bIsRandomizerPalLevelRandom",
        label: "Niveau Pal aléatoire",
        type: "boolean",
        description:
          "Randomise également le niveau des Pals en plus de leur espèce.",
      },
    ],
  },
  {
    label: "Ravitaillement & Chat",
    fields: [
      {
        key: "SupplyDropSpan",
        label: "Intervalle ravitaillement (min)",
        type: "number",
        description:
          "Intervalle en minutes entre chaque largage de ravitaillement aérien.",
      },
      {
        key: "ChatPostLimitPerMinute",
        label: "Messages chat/min max",
        type: "number",
        description:
          "Nombre maximum de messages qu'un joueur peut envoyer par minute (anti-spam).",
      },
    ],
  },
  {
    label: "Performance & Logs",
    fields: [
      {
        key: "ServerReplicatePawnCullDistance",
        label: "Distance culling serveur",
        type: "number",
        description:
          "Distance au-delà de laquelle le serveur arrête de répliquer les Pals aux clients. Plus bas = moins de charge réseau.",
      },
      {
        key: "LogFormatType",
        label: "Format des logs",
        type: "text",
        description: "Format des logs serveur (text ou json).",
      },
    ],
  },
];
