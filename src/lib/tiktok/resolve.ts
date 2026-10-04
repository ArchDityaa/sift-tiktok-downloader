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

const PER_PROVIDER_MS = 4500;
const TOTAL_BUDGET_MS = 8500;

export interface ResolveOutcome {
  result: TikTokResult;
  /** Per-provider attempt log, useful for debugging in the console. */
  attempts: Array<{ name: string; ok: boolean; error?: string }>;
}

/**
 * Runs the provider chain sequentially and returns the first usable result.
 * A result is "usable" when it carries at least one downloadable file or,
 * failing that, a cover image. Keeps a partial (cover-only) fallback so the
 * user is never left with nothing.
 */
export async function resolveTikTok(url: string): Promise<ResolveOutcome> {
  const attempts: ResolveOutcome["attempts"] = [];
  let bestPartial: TikTokResult | null = null;
  const started = Date.now();

  for (const link of CHAIN) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining <= 500) break;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Math.min(PER_PROVIDER_MS, remaining),
    );

    try {
      const result = await link.run(url, controller.signal);
      if (result.media.length > 0) {
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
    } finally {
      clearTimeout(timeout);
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

export class ResolveError extends Error {
  attempts: ResolveOutcome["attempts"];
  constructor(message: string, attempts: ResolveOutcome["attempts"]) {
    super(message);
    this.name = "ResolveError";
    this.attempts = attempts;
  }
}
