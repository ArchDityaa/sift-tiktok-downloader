import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

function sanitizeFilename(input: string | null, fallback: string): string {
  if (!input) return fallback;
  const cleaned = input
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

/**
 * Streams a remote media file back to the browser so the Save dialog can
 * force a filename and avoid cross-origin download limits. Restricted to
 * known TikTok / image CDN hosts to keep it from becoming an open proxy.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("filename");

  if (!raw) {
    return new Response("Missing url parameter.", { status: 400 });
  }

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
  const fallbackName = `sift-download.${/^(mp4|mp3|jpe?g|png|webp|mov)$/.test(ext) ? ext : "mp4"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const upstream = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        Referer: "https://www.tiktok.com/",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Media is unavailable upstream.", {
        status: 502,
      });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const length = upstream.headers.get("content-length");

    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitizeFilename(name, fallbackName)}"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    if (length) headers.set("Content-Length", length);

    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response("Failed to fetch media.", { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
