import { intervalToDuration } from "date-fns";

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  const d = intervalToDuration({ start: 0, end: seconds * 1000 });
  const parts: string[] = [];
  if (d.days) parts.push(`${d.days}j`);
  if (d.hours) parts.push(`${d.hours}h`);
  if (d.minutes !== undefined && (d.days || d.hours)) {
    parts.push(`${String(d.minutes).padStart(2, "0")}m`);
  } else if (d.minutes) {
    parts.push(`${d.minutes}m`);
  }
  return parts.length ? parts.join("") : `${d.seconds ?? 0}s`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale === "fr" ? "fr-FR" : "en-US");
}
