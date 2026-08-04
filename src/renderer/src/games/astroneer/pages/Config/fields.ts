export type Settings = Record<string, string | number | boolean>;

export interface FieldDef {
  key: string;
  type: "text" | "number" | "boolean";
}

export interface FieldGroup {
  labelKey: string;
  fields: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    labelKey: "astroneerConfig.groups.general",
    fields: [
      { key: "ServerName", type: "text" },
      { key: "ServerAdvertisedName", type: "text" },
      { key: "PublicIP", type: "text" },
      { key: "ServerPassword", type: "text" },
      { key: "Port", type: "number" },
    ],
  },
  {
    labelKey: "astroneerConfig.groups.players",
    fields: [
      { key: "MaxPlayerCount", type: "number" },
      { key: "OwnerName", type: "text" },
      { key: "OwnerGuid", type: "text" },
      { key: "PlayerActivityTimeout", type: "number" },
      { key: "DenyUnlistedPlayers", type: "boolean" },
    ],
  },
  {
    labelKey: "astroneerConfig.groups.save",
    fields: [
      { key: "ActiveSaveFileDescriptiveName", type: "text" },
      { key: "AutoSaveGameInterval", type: "number" },
      { key: "BackupSaveGamesInterval", type: "number" },
    ],
  },
  {
    labelKey: "astroneerConfig.groups.performance",
    fields: [
      { key: "MaxServerFramerate", type: "number" },
      { key: "MaxServerIdleFramerate", type: "number" },
    ],
  },
  {
    labelKey: "astroneerConfig.groups.advanced",
    fields: [
      { key: "bDisableServerTravel", type: "boolean" },
      { key: "VerbosePlayerProperties", type: "boolean" },
      { key: "ConsolePort", type: "number" },
      { key: "ConsolePassword", type: "text" },
    ],
  },
];
