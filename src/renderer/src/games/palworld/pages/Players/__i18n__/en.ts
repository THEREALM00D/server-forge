export default {
  players: {
    title: "Players",
    subtitle:
      "Connection history automatically tracked while the server is running (REST API required)",
    search: "Search by name or ID",
    none: "No players tracked yet. Tracking starts as soon as a player connects.",
    noResults: 'No player matches "{{query}}".',
    online: "Online",
    offline: "Offline",
    summary: {
      total: "{{count}} player",
      total_other: "{{count}} players",
      online: "{{count}} online",
    },
    columns: {
      name: "Name",
      status: "Status",
      lastSeen: "Last seen",
      playtime: "Total playtime",
      sessions: "Sessions",
      ip: "Last IP",
      actions: "",
    },
    actions: {
      remove: "Remove from history",
      removeConfirm: "Remove {{name}} from history?",
      clear: "Clear all history",
      clearConfirm: "Clear all player history? This action cannot be undone.",
    },
    notify: {
      cleared: "History cleared.",
      removed: "{{name}} removed from history.",
      cannotLoad: "Cannot load history.",
      removeFailed: "Unable to remove {{name}}.",
      clearFailed: "Unable to clear history.",
    },
    detail: {
      firstSeen: "First seen",
      sessionCount: "Sessions",
      lastIp: "Last IP",
      recentSessions: "Recent sessions",
      sessionDuration: "Duration",
      ongoing: "Ongoing",
    },
    duration: {
      seconds: "{{count}}s",
      minutes: "{{count}}m",
      hoursMinutes: "{{hours}}h {{minutes}}m",
      days: "{{days}}d {{hours}}h",
    },
    relative: {
      now: "just now",
      minutes: "{{count}} min ago",
      hours: "{{count}} h ago",
      days: "{{count}} d ago",
    },
  },
};
