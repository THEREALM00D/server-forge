export default {
  valheimMods: {
    title: "Mods",
    subtitle: "Manage your Valheim server mods via Thunderstore",
    tabs: {
      installed: "Installed",
      browse: "Browse",
    },
    bepinex: {
      warning:
        "BepInEx not detected in the server folder. Most Valheim mods require BepInEx to work.",
      ok: "BepInEx detected",
      install: "Install BepInEx",
      installing: "Installing…",
      success: "BepInEx installed successfully",
    },
    installed: {
      empty:
        "No mods installed. Browse Thunderstore or import an r2modman profile.",
      remove: "Uninstall",
      removeConfirm: "Uninstall {{name}}?",
      enabled: "Enabled",
      disabled: "Disabled",
      manual: "Manual",
      installedAt: "Installed on {{date}}",
      updatedAt: "Thunderstore update: {{date}}",
      version: "v{{version}}",
      loadFailed: "Unable to load installed mods",
    },
    thunderstore: {
      title: "Thunderstore Code",
      label: "Package code",
      helper:
        "Format: Author-ModName-Version (e.g. denikson-BepInExPack_Valheim-5.4.2202)",
      importProfile: "Import profile",
      profileLabel: "Profile code",
      profileHelper:
        "Paste the code exported from Thunderstore or r2modman (Settings → Export profile → Copy code)",
      importProfileFile: "Import from a file (.r2z)",
      install: "Install",
      success: "{{name}} installed from Thunderstore",
      profileSuccess: "{{count}} mod(s) installed from profile",
      profileErrors: "{{count}} mod(s) failed — see notifications",
    },
    browse: {
      tabs: {
        trending: "Trending",
        latest: "New",
        updated: "Updated",
      },
      search: "Search Thunderstore…",
      searchBtn: "Search",
      clearSearch: "Clear",
      installLatest: "Install latest version",
      openOnThunderstore: "Open on Thunderstore",
      openTooltip: "Opens the mod page on Thunderstore",
      viewFiles: "Versions",
      filesDialog: {
        title: "Versions of {{name}}",
        close: "Close",
        size: "{{size}} KB",
        noFiles: "No versions available",
      },
      endorsements: "{{count}} stars",
      loading: "Loading…",
      error: "Unable to load Thunderstore mods",
    },
    folders: {
      plugins: "Mods folder",
      config: "Mod configs",
    },
    nxm: {
      installing: "Installing…",
      success: "{{name}} installed successfully",
      error: "Installation error: {{error}}",
    },
    deps: {
      title: "Required dependencies",
      subtitle:
        "{{name}} requires {{count}} uninstalled mod(s). Install them now?",
      installAll: "Install all ({{count}})",
      skip: "Skip",
    },
    updates: {
      newVersion: "v{{version}} available",
      updateBtn: "Update to v{{version}}",
      refresh: "Check for updates",
    },
  },
};
