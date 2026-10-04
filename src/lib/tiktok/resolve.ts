import type { TikTokResult } from "./types";
import { extractWithTikwm } from "./providers/tikwm";
import { extractWithNative } from "./providers/native";
import { extractWithOembed } from "./providers/oembed";

type Provider = (url: string, signal: AbortSignal) => Promise<TikTokResult>;

interface ChainLink {
  name: string;
  run: Provider;
}

const CHAIN: ChainLink[] = [
  { name: "gateway", run: extractWithTikwm },
  { name: "native", run: extractWithNative },
  { name: "oembed", run: extractWithOembed },
];

const PER_PROVIDER_MS = 4200;
const TOTAL_BUDGET_MS = 8000;

export interface ResolveOutcome {
  result: TikTokResult;
  /** Per-provider attempt log, useful for debugging in the console. */
  attempts: Array<{ name: string; ok: boolean; error?: string }>;
}

export class ResolveError extends Error {
  attempts: ResolveOutcome["attempts"];
  constructor(message: string, attempts: ResolveOutcome["attempts"]) {
    super(message);
    this.name = "ResolveError";
    this.attempts = attempts;
  }
}

interface CacheEntry {
  outcome: ResolveOutcome;
  expires: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map<string, CacheEntry>();

function cacheKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

async function withTimeout(
  run: Provider,
  url: string,
  timeoutMs: number,
): Promise<TikTokResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(url, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function isUsable(result: TikTokResult): boolean {
  return result.media.some((item) => item.kind === "video" || item.kind === "audio" || item.kind === "image");
}

async function runChain(url: string): Promise<ResolveOutcome> {
  const attempts: ResolveOutcome["attempts"] = [];
  let bestPartial: TikTokResult | null = null;
  const started = Date.now();

  for (const link of CHAIN) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining <= 500) break;

    try {
      const result = await withTimeout(
        link.run,
        url,
        Math.min(PER_PROVIDER_MS, remaining),
      );
      if (isUsable(result)) {
        attempts.push({ name: link.name, ok: true });
        return { result, attempts };
      }
      if (!bestPartial && result.cover) bestPartial = result;
      attempts.push({ name: link.name, ok: false, error: "no media" });
    } catch (error) {
      attempts.push({
        name: link.name,
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  if (bestPartial) {
    attempts.push({ name: "fallback", ok: true, error: "cover only" });
    return { result: bestPartial, attempts };
  }

  throw new ResolveError(
    "We could not read this TikTok link. Check that the post is public and try again.",
    attempts,
  );
}

/**
 * Runs the provider chain sequentially and returns the first usable result.
 * Successful lookups are memoised for a short window so repeat requests for
 * the same post do not hammer the upstream sources.
 */
export async function resolveTikTok(url: string): Promise<ResolveOutcome> {
  const key = cacheKey(url);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.outcome;
  }

  const outcome = await runChain(url);

  if (cache.size > CACHE_MAX) {
    for (const [k, value] of cache) {
      if (value.expires <= Date.now()) cache.delete(k);
    }
  }
  cache.set(key, { outcome, expires: Date.now() + CACHE_TTL_MS });
  return outcome;
}
