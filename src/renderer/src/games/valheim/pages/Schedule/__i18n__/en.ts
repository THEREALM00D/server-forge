export default {
  schedule: {
    title: "Schedule",
    subtitle: "Automatic daily server restart",
    enabled: "Enable scheduled restart",
    time: "Time (24h)",
    warning: "Warning (minutes before)",
    warningHelper:
      "Delay between the announcement and the shutdown (0 = immediate)",
    message: "Announcement message",
    messageHelper: "{minutes} will be replaced by the delay",
    save: "Save",
    notify: {
      saved: "Schedule saved",
    },
  },
  valheimSchedule: {
    noApiInfo:
      "Valheim has no REST API — the restart will be forced (taskkill). No announcement or automatic save is performed.",
  },
};
