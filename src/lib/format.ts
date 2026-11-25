const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

/** "5 minutes ago", "yesterday". Pair with formatDateTime in a title or tooltip. */
export function formatRelative(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 2_592_000) return relative.format(Math.round(seconds / 86_400), "day");
  return formatDateTime(iso);
}

/** First block of a UUID, enough to recognise a request in a list. */
export function shortId(id: string): string {
  return id.split("-")[0] ?? id;
}

export function formatDuration(startIso: string, endIso: string | null, now = Date.now()): string {
  const end = endIso ? new Date(endIso).getTime() : now;
  const total = Math.max(0, Math.round((end - new Date(startIso).getTime()) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
