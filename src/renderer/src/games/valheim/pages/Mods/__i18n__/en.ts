export default {
  valheimMods: {
    title: "Mods",
    subtitle: "Manage your Valheim server mods via NexusMods",
    tabs: {
      installed: "Installed",
      browse: "Browse",
    },
    apiKey: {
      title: "NexusMods Connection",
      label: "API Key",
      placeholder: "Your NexusMods API key",
      helper: "Generate a key at nexusmods.com → account → Settings → API Keys",
      validate: "Validate",
      validating: "Checking…",
      connected: "Connected as {{username}}",
      premium: "Premium",
      free: "Free",
      invalid: "Invalid API key",
      saved: "API key saved",
    },
    bepinex: {
      warning:
        "BepInEx not detected in the server folder. Most Valheim mods require BepInEx to work.",
      ok: "BepInEx detected",
    },
    installed: {
      empty:
        'No mods installed. Browse NexusMods to find mods, then click "Mod Manager Download" on the site.',
      remove: "Uninstall",
      removeConfirm: "Uninstall {{name}}?",
      enabled: "Enabled",
      disabled: "Disabled",
      installedAt: "Installed on {{date}}",
      version: "v{{version}}",
    },
    browse: {
      tabs: {
        trending: "Trending",
        latest: "New",
        updated: "Updated",
      },
      openOnNexus: "Open on NexusMods",
      openTooltip:
        'Opens the mod page on NexusMods. Then click "Mod Manager Download" to install it.',
      viewFiles: "Files",
      filesDialog: {
        title: "Files for {{name}}",
        close: "Close",
        size: "{{size}} KB",
        noFiles: "No files available",
      },
      endorsements: "{{count}} endorsements",
      noApiKey: "Configure your NexusMods API key to browse mods.",
      publicMode:
        "Public mode (top 5, no API key). Configure your key to see more mods and unlock the New and Updated tabs.",
      loading: "Loading…",
      error: "Unable to load mods",
    },
    nxm: {
      installing: "Installing from NexusMods…",
      success: "{{name}} installed successfully",
      error: "Installation error: {{error}}",
    },
  },
};
