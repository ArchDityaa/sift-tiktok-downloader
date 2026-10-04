export function formatCount(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "0";
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const n = value / 1000;
    return `${n >= 100 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (value < 1_000_000_000) {
    const n = value / 1_000_000;
    return `${n >= 100 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, "")}M`;
  }
  const n = value / 1_000_000_000;
  return `${n.toFixed(1).replace(/\.0$/, "")}B`;
}

export function formatDuration(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(input?: number | string): string | null {
  if (!input) return null;
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return cleaned || "sift-download";
}
