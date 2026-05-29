export default {
  valheimConfig: {
    title: "Server Configuration",
    subtitle: "valheim_server.exe launch arguments",
    openSaves: "Open saves folder",
    save: "Save",
    saved: "Saved!",
    noServerPath: "Configure the server path in the Installation tab.",
    sections: {
      general: "General",
      world: "World",
      network: "Network",
      advanced: "Advanced",
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
          "Custom path for worlds. Empty = %APPDATA%\\Roaming\\Valheim.",
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
  },
};
