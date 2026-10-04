const TIKTOK_HOSTS = [
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "t.tiktok.com",
];

/** Accepts only http(s) URLs pointing at a known TikTok host. */
export function parseTikTokUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw) return null;

  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  const allowed = TIKTOK_HOSTS.some(
    (h) => host === h || host.endsWith(`.${h}`),
  );
  if (!allowed) return null;

  return url;
}

export function isTikTokUrl(input: string): boolean {
  return parseTikTokUrl(input) !== null;
}

/** Best-effort numeric id for naming and history keys. */
export function extractVideoId(input: string): string | null {
  const url = parseTikTokUrl(input);
  if (!url) return null;
  const match = url.pathname.match(/\/(?:video|photo)\/(\d+)/);
  if (match) return match[1];
  const trailing = url.pathname.match(/(\d{8,})/);
  if (trailing) return trailing[1];
  return null;
}
