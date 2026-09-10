export default {
  valheimConfig: {
    title: "Server Configuration",
    subtitle: "valheim_server.exe launch arguments",
    openServerFolder: "Open server folder",
    save: "Save",
    saved: "Saved!",
    noServerPath: "Configure the server path in the Installation tab.",
    sections: {
      general: "General",
      world: "World",
      modifiers: "World Modifiers",
      network: "Network",
      advanced: "Advanced",
      administration: "Administration",
    },
    modifiers: {
      description:
        "Adjust world difficulty via -modifier arguments. Use a preset or configure each parameter individually.",
      default: "Default",
      presets: {
        casual: "Casual",
        normal: "Normal",
        hard: "Hard",
        hardcore: "Hardcore",
      },
      combat: {
        label: "Combat",
        veryeasy: "Very easy",
        easy: "Easy",
        hard: "Hard",
        veryhard: "Very hard",
      },
      deathpenalty: {
        label: "Death penalty",
        casual: "None (keep everything on death)",
        veryeasy: "Very light",
        easy: "Light",
        hard: "Harsh",
        hardcore: "Extreme",
      },
      resources: {
        label: "Resources",
        muchless: "Much less",
        less: "Less",
        more: "More",
        muchmore: "Much more",
        most: "Most",
      },
      raids: {
        label: "Raids",
        none: "None",
        muchless: "Very rare",
        less: "Rare",
        more: "Frequent",
        muchmore: "Very frequent",
      },
      portals: {
        label: "Portals",
        casual: "Open",
        hard: "Restricted",
        veryhard: "Very restricted",
      },
    },
    fields: {
      name: {
        label: "Server name",
        description: "Name displayed in the Steam server list.",
      },
      world: {
        label: "World name",
        description: "World file name (without extension).",
      },
      password: {
        label: "Password",
        description:
          "Leave empty for a public server (min. 5 characters if set).",
        tooShort:
          "Too short: Valheim requires at least 5 characters, otherwise the server refuses to start.",
      },
      port: {
        label: "Port",
        description: "UDP game port. The query port is automatically port+1.",
      },
      public: {
        label: "Public server (Steam)",
        description: "Makes the server visible in the Steam community list.",
      },
      savedir: {
        label: "Saves folder",
        description:
          "Custom path for worlds. Empty = %LOCALAPPDATA%\\..\\LocalLow\\IronGate\\Valheim.",
      },
      worldSeed: {
        label: "World seed",
        description: "World generation seed. Empty = random.",
      },
      worldSize: {
        label: "World size",
        default: "Default",
        small: "Small",
        medium: "Medium",
        large: "Large",
        yolo: "Yolo (very large)",
      },
      crossplay: {
        label: "Crossplay (Xbox)",
        description: "Enables crossplay between PC and Xbox via Xbox network.",
      },
      logFile: {
        label: "Log file",
        description: "Path to a custom log file. Empty = default behavior.",
      },
      customArgs: {
        label: "Extra arguments",
        description: "Additional arguments appended to the command line.",
      },
    },
    administration: {
      description:
        "Access control files (one SteamID64 per line). Located in the saves folder.",
      adminList: "Admins (adminlist.txt)",
      adminListHelper:
        "Access to in-game admin commands (/kick, /ban, /debugmode…)",
      bannedList: "Banned players (bannedlist.txt)",
      bannedListHelper: "Players blocked from connecting.",
      permittedList: "Whitelist (permittedlist.txt)",
      permittedListHelper: "If not empty, only these players can connect.",
      save: "Save",
      saved: "Saved!",
      saveFailed: "Unable to save the list",
      loadFailed: "Unable to load the list",
    },
  },
};
