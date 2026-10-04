import { NextRequest } from "next/server";
import { rateLimit, clientIp, isLikelyCrossSite } from "@/lib/rate-limit";
import { reconcileFilename } from "@/lib/media-type";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const ALLOWED_EXT = new Set([
  "mp4",
  "mp3",
  "m4a",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "mov",
]);

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.endsWith("tiktokcdn.com") ||
    host.endsWith("tiktokcdn-us.com") ||
    host.endsWith("tiktokcdn-eu.com") ||
    host.endsWith("tiktokv.com") ||
    host.endsWith("tiktokv.us") ||
    host.endsWith("tiktok.com") ||
    host.endsWith("ibyteimg.com") ||
    host.endsWith("byteimg.com") ||
    host.endsWith("tikwm.com") ||
    host.endsWith("douyinpic.com") ||
    host.endsWith("muscdn.com") ||
    host.endsWith("musical.ly")
  );
}

function sanitizeBase(input: string | null): string {
  if (!input) return "sift-download";
  const cleaned = input
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return cleaned || "sift-download";
}

/**
 * Streams a remote media file back to the browser so the Save dialog can
 * force a filename and avoid cross-origin download limits. Restricted to
 * known TikTok / image CDN hosts to keep it from becoming an open proxy.
 * The `Range` request header is forwarded so the player and resumable
 * downloads keep working.
 */
export async function GET(req: NextRequest) {
  const limit = rateLimit(`proxy:${clientIp(req)}`, 60, 60_000);
  if (!limit.ok) {
    return new Response("Too many requests.", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  if (isLikelyCrossSite(req)) {
    return new Response("Cross-site requests are not allowed.", { status: 403 });
  }

  const raw = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("filename");

  if (!raw) return new Response("Missing url parameter.", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Invalid url.", { status: 400 });
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("Unsupported protocol.", { status: 400 });
  }

  if (!isAllowedHost(target.hostname)) {
    return new Response("Host not allowed.", { status: 403 });
  }

  const ext = target.pathname.split(".").pop()?.toLowerCase() ?? "";
  const base = sanitizeBase(name);
  const fallbackName = `${base}.${ALLOWED_EXT.has(ext) ? ext : "mp4"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const requestHeaders: Record<string, string> = {
      "User-Agent": UA,
      Accept: "*/*",
      Referer: "https://www.tiktok.com/",
    };
    const range = req.headers.get("range");
    if (range) requestHeaders.Range = range;

    const upstream = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: requestHeaders,
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Media is unavailable upstream.", { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const corrected = reconcileFilename(fallbackName, contentType, base);

    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${corrected.filename}"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    for (const header of ["content-length", "content-range"]) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch {
    return new Response("Failed to fetch media.", { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
