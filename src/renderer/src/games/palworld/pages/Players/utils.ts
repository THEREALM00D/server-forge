import type { TFunction } from "i18next";

export function formatDuration(ms: number, t: TFunction): string {
  if (ms < 60_000)
    return t("players.duration.seconds", { count: Math.floor(ms / 1000) });
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 60)
    return t("players.duration.minutes", { count: totalMinutes });
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalHours < 24)
    return t("players.duration.hoursMinutes", { hours: totalHours, minutes });
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return t("players.duration.days", { days, hours });
}

export function formatRelative(ts: number, t: TFunction): string {
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return t("players.relative.now");
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return t("players.relative.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t("players.relative.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("players.relative.days", { count: days });
}

export function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale === "fr" ? "fr-FR" : "en-US");
}
