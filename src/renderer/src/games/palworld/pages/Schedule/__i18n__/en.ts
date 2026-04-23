export default {
  schedule: {
    title: "Schedule",
    subtitle: "Automatic daily server restart",
    apiWarning:
      "The REST API is disabled — without it, the scheduled restart won't be able to save the world before stopping.",
    enableApi: "Enable",
    enabled: "Enable scheduled restart",
    time: "Time (24h)",
    warning: "Warning (minutes before)",
    warningHelper:
      "Delay between the announcement and the shutdown (0 = immediate)",
    message: "Announcement message",
    messageHelper: "{minutes} will be replaced by the delay",
    save: "Save",
    notify: {
      apiEnabled: "REST API enabled. Restart the server.",
      apiEnableFailed: "Enable failed",
      apiCannotWrite: "Unable to modify the configuration",
      saved: "Schedule saved",
    },
  },
};
