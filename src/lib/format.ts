export function parseDuration(duration: string | null | undefined): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (h ?? 0) * 3600 + (m ?? 0) * 60 + Math.floor(s ?? 0);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m ?? 0) * 60 + Math.floor(s ?? 0);
  }
  return 0;
}

export function formatDuration(duration: string | null | undefined): string {
  const total = parseDuration(duration);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SD" : "en-US").format(
    value,
  );
}

export function formatDate(
  date: string | null | undefined,
  locale: string,
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Compact counts for YouTube-style meta (e.g. 1.2K, 3.4M). */
export function formatCompactCount(value: number, locale: string): string {
  const lang = locale === "ar" ? "ar" : "en";
  return new Intl.NumberFormat(lang, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Relative publish time (e.g. "17 hours ago"). */
export function formatRelativeDate(
  date: string | null | undefined,
  locale: string,
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  const now = Date.now();
  const diffSec = Math.round((d.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", {
    numeric: "auto",
  });

  if (abs < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  return rtf.format(Math.round(diffMonth / 12), "year");
}

/** YouTube-style stats line without icons. */
export function formatYoutubeStats(
  views: number,
  likes: number,
  locale: string,
  labels: { views: string; likes: string },
): string {
  const viewsLabel = formatCompactCount(views, locale);
  const likesLabel = formatCompactCount(likes, locale);
  return `${viewsLabel} ${labels.views} · ${likesLabel} ${labels.likes}`;
}
