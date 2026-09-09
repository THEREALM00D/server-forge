import type {
  ConfigSettings,
  SelectOption,
  FieldDef,
  FieldGroup,
} from "../../../../components/config/types";

export type Settings = ConfigSettings;
export type { SelectOption, FieldDef, FieldGroup };

export const FIELD_GROUPS: FieldGroup[] = [
  {
    labelKey: "config.groups.server",
    fields: [
      { key: "ServerName", type: "text" },
      { key: "ServerDescription", type: "text" },
      { key: "PublicIP", type: "text" },
      { key: "PublicPort", type: "number" },
      { key: "ServerPlayerMaxNum", type: "number" },
      { key: "CoopPlayerMaxNum", type: "number" },
      { key: "ServerPassword", type: "text" },
      { key: "AdminPassword", type: "text" },
      { key: "Region", type: "text" },
    ],
  },
  {
    labelKey: "config.groups.rcon",
    fields: [
      { key: "RCONEnabled", type: "boolean" },
      { key: "RCONPort", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.restapi",
    fields: [
      { key: "RESTAPIEnabled", type: "boolean" },
      { key: "RESTAPIPort", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.security",
    fields: [
      { key: "bUseAuth", type: "boolean" },
      { key: "BanListURL", type: "text" },
      { key: "CrossplayPlatforms", type: "text" },
      { key: "bAllowClientMod", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.time",
    fields: [
      { key: "DayTimeSpeedRate", type: "number" },
      { key: "NightTimeSpeedRate", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.xp",
    fields: [
      { key: "ExpRate", type: "number" },
      { key: "CollectionDropRate", type: "number" },
      { key: "CollectionObjectHpRate", type: "number" },
      { key: "CollectionObjectRespawnSpeedRate", type: "number" },
      { key: "EnemyDropItemRate", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.palMechanics",
    fields: [
      { key: "PalCaptureRate", type: "number" },
      { key: "PalSpawnNumRate", type: "number" },
      { key: "PalDamageRateAttack", type: "number" },
      { key: "PalDamageRateDefense", type: "number" },
      { key: "PalStomachDecreaceRate", type: "number" },
      { key: "PalStaminaDecreaceRate", type: "number" },
      { key: "PalAutoHPRegeneRate", type: "number" },
      { key: "PalAutoHpRegeneRateInSleep", type: "number" },
      { key: "PalEggDefaultHatchingTime", type: "number" },
      { key: "bPalLost", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.playerStats",
    fields: [
      { key: "PlayerDamageRateAttack", type: "number" },
      { key: "PlayerDamageRateDefense", type: "number" },
      { key: "PlayerStomachDecreaceRate", type: "number" },
      { key: "PlayerStaminaDecreaceRate", type: "number" },
      { key: "PlayerAutoHPRegeneRate", type: "number" },
      { key: "PlayerAutoHpRegeneRateInSleep", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.statPoints",
    fields: [
      { key: "bAllowEnhanceStat_Attack", type: "boolean" },
      { key: "bAllowEnhanceStat_Health", type: "boolean" },
      { key: "bAllowEnhanceStat_Stamina", type: "boolean" },
      { key: "bAllowEnhanceStat_Weight", type: "boolean" },
      { key: "bAllowEnhanceStat_WorkSpeed", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.building",
    fields: [
      { key: "BuildObjectDamageRate", type: "number" },
      { key: "BuildObjectDeteriorationDamageRate", type: "number" },
      { key: "BaseCampMaxNum", type: "number" },
      { key: "BaseCampWorkerMaxNum", type: "number" },
      { key: "BaseCampMaxNumInGuild", type: "number" },
      { key: "MaxBuildingLimitNum", type: "number" },
      { key: "bBuildAreaLimit", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.items",
    fields: [
      { key: "WorkSpeedRate", type: "number" },
      { key: "DropItemMaxNum", type: "number" },
      { key: "DropItemAliveMaxHours", type: "number" },
      { key: "EquipmentDurabilityDamageRate", type: "number" },
      { key: "ItemWeightRate", type: "number" },
      { key: "ItemCorruptionMultiplier", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.death",
    fields: [
      {
        key: "DeathPenalty",
        type: "select",
        options: [
          { value: "None", labelKey: "config.deathPenalty.none" },
          { value: "Item", labelKey: "config.deathPenalty.item" },
          {
            value: "ItemAndEquipment",
            labelKey: "config.deathPenalty.itemAndEquipment",
          },
          { value: "All", labelKey: "config.deathPenalty.all" },
        ],
      },
      { key: "BlockRespawnTime", type: "number" },
      { key: "RespawnPenaltyDurationThreshold", type: "number" },
      { key: "RespawnPenaltyTimeScale", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.guild",
    fields: [
      { key: "GuildPlayerMaxNum", type: "number" },
      { key: "GuildRejoinCooldownMinutes", type: "number" },
      { key: "bAutoResetGuildNoOnlinePlayers", type: "boolean" },
      { key: "AutoResetGuildTimeNoOnlinePlayers", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.pvp",
    fields: [
      { key: "bIsPvP", type: "boolean" },
      { key: "bEnablePlayerToPlayerDamage", type: "boolean" },
      { key: "bEnableFriendlyFire", type: "boolean" },
      { key: "bCanPickupOtherGuildDeathPenaltyDrop", type: "boolean" },
      { key: "bAdditionalDropItemWhenPlayerKillingInPvPMode", type: "boolean" },
      {
        key: "AdditionalDropItemNumWhenPlayerKillingInPvPMode",
        type: "number",
      },
      { key: "AdditionalDropItemWhenPlayerKillingInPvPMode", type: "text" },
      { key: "bEnableDefenseOtherGuildPlayer", type: "boolean" },
      { key: "bDisplayPvPItemNumOnWorldMap_Player", type: "boolean" },
      { key: "bDisplayPvPItemNumOnWorldMap_BaseCamp", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.gameplay",
    fields: [
      {
        key: "Difficulty",
        type: "select",
        options: [
          { value: "None", labelKey: "config.difficulty.none" },
          { value: "Casual", labelKey: "config.difficulty.casual" },
          { value: "Normal", labelKey: "config.difficulty.normal" },
          { value: "Hard", labelKey: "config.difficulty.hard" },
        ],
      },
      { key: "bIsMultiplay", type: "boolean" },
      { key: "bHardcore", type: "boolean" },
      { key: "bCharacterRecreateInHardcore", type: "boolean" },
      { key: "bEnableFastTravel", type: "boolean" },
      { key: "bEnableFastTravelOnlyBaseCamp", type: "boolean" },
      { key: "bIsStartLocationSelectByMap", type: "boolean" },
      { key: "bExistPlayerAfterLogout", type: "boolean" },
      { key: "bEnableInvaderEnemy", type: "boolean" },
      { key: "bEnableNonLoginPenalty", type: "boolean" },
      { key: "bEnableAimAssistPad", type: "boolean" },
      { key: "bEnableAimAssistKeyboard", type: "boolean" },
      { key: "bIsShowJoinLeftMessage", type: "boolean" },
      { key: "bShowPlayerList", type: "boolean" },
      { key: "bIsUseBackupSaveData", type: "boolean" },
      { key: "bAllowGlobalPalboxExport", type: "boolean" },
      { key: "bAllowGlobalPalboxImport", type: "boolean" },
      { key: "bInvisibleOtherGuildBaseCampAreaFX", type: "boolean" },
      { key: "bActiveUNKO", type: "boolean" },
      { key: "DenyTechnologyList", type: "text" },
    ],
  },
  {
    labelKey: "config.groups.randomizer",
    fields: [
      { key: "RandomizerType", type: "text" },
      { key: "RandomizerSeed", type: "number" },
      { key: "bIsRandomizerPalLevelRandom", type: "boolean" },
    ],
  },
  {
    labelKey: "config.groups.supplyChat",
    fields: [
      { key: "SupplyDropSpan", type: "number" },
      { key: "ChatPostLimitPerMinute", type: "number" },
    ],
  },
  {
    labelKey: "config.groups.perfLogs",
    fields: [
      { key: "ServerReplicatePawnCullDistance", type: "number" },
      { key: "LogFormatType", type: "text" },
    ],
  },
];
