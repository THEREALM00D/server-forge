export default {
  servers: {
    title: "Servers",
    subtitle: "All your dedicated servers. Click a server to set it as active.",
    empty: "No server configured. Add your first server to get started.",
    active: "Active",
    addServer: "Add server",
    columns: {
      name: "Name",
      game: "Game",
      path: "Path",
      actions: "",
    },
    games: {
      palworld: "Palworld",
    },
    actions: {
      activate: "Activate",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm:
        'Delete server "{{name}}"? Game files stay intact, only ServerForge configuration is removed.',
    },
    dialog: {
      addTitle: "New server",
      editTitle: "Edit server",
      name: "Name",
      nameHelper: "E.g.: FREEPORT, PvE Casual, Test",
      path: "Server folder",
      pathHelper:
        "Folder containing PalServer.exe (e.g. E:\\Server\\Palworld_Freeport)",
      pathBrowse: "Browse",
      gameType: "Game",
      color: "Color",
      save: "Save",
      cancel: "Cancel",
    },
    notify: {
      created: 'Server "{{name}}" added.',
      updated: 'Server "{{name}}" updated.',
      deleted: "Server deleted.",
      activated: '"{{name}}" is now the active server.',
      pathRequired: "Server path is required.",
      nameRequired: "Server name is required.",
    },
  },
};
