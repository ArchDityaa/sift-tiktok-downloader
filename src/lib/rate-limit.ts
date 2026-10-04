import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

export interface RateResult {
  ok: boolean;
  /** Seconds until the window resets, for the Retry-After header. */
  retryAfter: number;
}

/**
 * Best-effort in-memory limiter. Serverless instances are ephemeral and
 * per-instance, so this deters casual abuse rather than enforcing a hard
 * quota. For a strict limit, back it with a shared store.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.reset) {
    if (buckets.size > 5000) {
      for (const [k, value] of buckets) {
        if (now > value.reset) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

/**
 * Rejects obvious browser-cross-origin calls while still allowing server-side
 * and direct requests that do not send Sec-Fetch-Site. Intentionally lenient.
 */
export function isLikelyCrossSite(req: NextRequest): boolean {
  const site = req.headers.get("sec-fetch-site");
  return site === "cross-site";
}
