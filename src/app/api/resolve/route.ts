import { NextRequest, NextResponse } from "next/server";
import { resolveTikTok, ResolveError } from "@/lib/tiktok/resolve";
import { parseTikTokUrl } from "@/lib/tiktok/url";
import { rateLimit, clientIp, isLikelyCrossSite } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const MAX_BODY = 8 * 1024;

export async function POST(req: NextRequest) {
  if (isLikelyCrossSite(req)) {
    return NextResponse.json(
      { ok: false, error: "Cross-site requests are not allowed." },
      { status: 403 },
    );
  }

  const limit = rateLimit(`resolve:${clientIp(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) {
      return NextResponse.json(
        { ok: false, error: "Request is too large." },
        { status: 413 },
      );
    }
    body = JSON.parse(text || "{}");
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request." },
      { status: 400 },
    );
  }

  const url =
    typeof (body as { url?: unknown })?.url === "string"
      ? (body as { url: string }).url
      : "";

  if (!parseTikTokUrl(url)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Enter a valid TikTok link, for example https://www.tiktok.com/@user/video/123.",
      },
      { status: 400 },
    );
  }

  try {
    const { result } = await resolveTikTok(url);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof ResolveError
        ? error.message
        : "Something went wrong while reading this post. Please try again.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
