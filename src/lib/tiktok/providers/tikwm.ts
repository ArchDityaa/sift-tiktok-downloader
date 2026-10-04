import { extractVideoId } from "../url";
import type { MediaItem, TikTokResult } from "../types";

const TIKWM_BASE = "https://www.tikwm.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface TikwmResponse {
  code: number;
  msg?: string;
  data?: Record<string, unknown>;
}

async function callGateway(
  url: string,
  signal: AbortSignal,
): Promise<TikwmResponse> {
  const endpoint = new URL("/api/", TIKWM_BASE);
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("hd", "1");

  const res = await fetch(endpoint, {
    signal,
    cache: "no-store",
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!res.ok) {
    const error = new Error(`gateway responded ${res.status}`) as Error & {
      retryable?: boolean;
    };
    error.retryable = res.status >= 500;
    throw error;
  }

  return (await res.json()) as TikwmResponse;
}

/**
 * Primary extractor. Uses the public tikwm.com gateway which returns a
 * no-watermark play URL plus cover, audio and stats for most public posts.
 * No API key required. Retries once on transient server errors.
 */
export async function extractWithTikwm(
  url: string,
  signal: AbortSignal,
): Promise<TikTokResult> {
  let payload: TikwmResponse;
  try {
    payload = await callGateway(url, signal);
  } catch (error) {
    const retryable = (error as { retryable?: boolean }).retryable === true;
    if (!retryable || signal.aborted) throw error;
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (signal.aborted) throw new Error("aborted");
    payload = await callGateway(url, signal);
  }

  if (payload.code !== 0 || !payload.data) {
    throw new Error(payload.msg || "gateway returned no data");
  }

  return normalize(payload.data, url);
}

function asUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${TIKWM_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

function normalize(data: Record<string, unknown>, url: string): TikTokResult {
  const id = (typeof data.id === "string" && data.id) || extractVideoId(url) || "";

  const images = Array.isArray(data.images)
    ? data.images.filter((i): i is string => typeof i === "string")
    : [];

  const media: MediaItem[] = [];

  if (images.length > 0) {
    images.forEach((src, index) => {
      media.push({
        kind: "image",
        label: `Image ${index + 1} of ${images.length}`,
        url: src,
        ext: "jpg",
      });
    });
  } else {
    const hd = asUrl(data.hdplay);
    const noWm = asUrl(data.play) ?? hd;
    const wm = asUrl(data.wmplay);

    if (hd && hd !== noWm) {
      media.push({
        kind: "video",
        label: "MP4 - HD, no watermark",
        url: hd,
        ext: "mp4",
        quality: "hd",
        hasWatermark: false,
      });
    }
    if (noWm) {
      media.push({
        kind: "video",
        label: hd && hd !== noWm ? "MP4 - SD, no watermark" : "MP4 - No watermark",
        url: noWm,
        ext: "mp4",
        quality: hd && hd !== noWm ? "sd" : "hd",
        hasWatermark: false,
      });
    }
    if (wm && wm !== noWm) {
      media.push({
        kind: "video",
        label: "MP4 - With watermark",
        url: wm,
        ext: "mp4",
        hasWatermark: true,
      });
    }
  }

  const music = asUrl(data.music);
  if (music) {
    media.push({
      kind: "audio",
      label: "MP3 - Original sound",
      url: music,
      ext: "mp3",
    });
  }

  const author = (data.author ?? {}) as Record<string, unknown>;
  const musicInfo = (data.music_info ?? {}) as Record<string, unknown>;

  return {
    id,
    source: "gateway",
    url,
    title:
      (typeof data.title === "string" && data.title) ||
      (typeof musicInfo.title === "string" ? musicInfo.title : undefined),
    author: {
      handle: (typeof author.unique_id === "string" && author.unique_id) || "tiktok",
      nickname: (typeof author.nickname === "string" && author.nickname) || "TikTok",
      avatar: asUrl(author.avatar),
    },
    cover: asUrl(data.origin_cover) ?? asUrl(data.cover),
    duration: typeof data.duration === "number" ? data.duration : undefined,
    stats: {
      plays: num(data.play_count),
      likes: num(data.digg_count),
      comments: num(data.comment_count),
      shares: num(data.share_count),
    },
    createdAt: num(data.create_time),
    media,
    partial: media.length === 0,
    note:
      media.length === 0
        ? "Only the cover image could be recovered for this post."
        : undefined,
  };
}

function num(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}
