import { extractVideoId } from "../url";
import type { MediaItem, TikTokResult } from "../types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Native extractor. Reads the public TikTok web page and pulls the
 * rehydration JSON that ships with the document. Fragile by nature
 * (TikTok renames internal fields often) so it runs as a secondary source
 * behind a guard that swallows parse failures.
 */
export async function extractWithNative(
  url: string,
  signal: AbortSignal,
): Promise<TikTokResult> {
  const res = await fetch(url, {
    signal,
    cache: "no-store",
    redirect: "follow",
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) throw new Error(`tiktok responded ${res.status}`);

  const html = await res.text();
  const data = extractRehydration(html);
  if (!data) throw new Error("could not read embedded data");

  const item = locateItem(data);
  if (!item) throw new Error("no video item in embedded data");

  return normalize(item, url);
}

function extractRehydration(html: string): Record<string, unknown> | null {
  const patterns = [
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/,
    /<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/,
    /window\["__UNIVERSAL_DATA_FOR_REHYDRATION__"\]\s*=\s*([\s\S]*?);?\s*<\/script>/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]) as Record<string, unknown>;
      } catch {
        // try the next pattern
      }
    }
  }
  return null;
}

function locateItem(
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  const scope = data.__DEFAULT_SCOPE__ as Record<string, unknown> | undefined;
  const candidates = [
    scope?.["webapp.video-detail"],
    scope?.["webapp.photo-detail"],
    data.ItemModule,
    data.itemInfo,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const c = candidate as Record<string, unknown>;
    const struct =
      (c.itemInfo as Record<string, unknown> | undefined)?.itemStruct ??
      (c.itemStruct as Record<string, unknown> | undefined) ??
      c;
    if (struct && typeof struct === "object" && "id" in struct) {
      return struct as Record<string, unknown>;
    }
  }
  return null;
}

function listUrls(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const urls = (value as Record<string, unknown>).UrlList;
  if (!Array.isArray(urls)) return [];
  return urls.filter((u): u is string => typeof u === "string");
}

function normalize(
  item: Record<string, unknown>,
  url: string,
): TikTokResult {
  const video = (item.video ?? {}) as Record<string, unknown>;
  const author = (item.author ?? {}) as Record<string, unknown>;
  const music = (item.music ?? {}) as Record<string, unknown>;
  const stats = (item.stats ?? {}) as Record<string, unknown>;
  const imagePost = item.imagePost as Record<string, unknown> | undefined;

  const media: MediaItem[] = [];

  const slides = Array.isArray(imagePost?.images) ? imagePost?.images : [];
  if (slides.length > 0) {
    slides.forEach((img, index) => {
      const src =
        (img as Record<string, unknown>)?.imageURL ??
        ((img as Record<string, unknown>)?.imageURL as { urlList?: string[] })
          ?.urlList?.[0];
      const resolved =
        typeof src === "object" && src
          ? listUrls(src)[0]
          : typeof src === "string"
            ? src
            : undefined;
      if (resolved) {
        media.push({
          kind: "image",
          label: `Image ${index + 1} of ${slides.length}`,
          url: resolved,
          ext: "jpg",
        });
      }
    });
  }

  const downloadAddr = listUrls(video.downloadAddr)[0];
  const playAddr = listUrls(video.playAddr)[0];
  const bitrate = Array.isArray(video.bitrateInfo)
    ? (video.bitrateInfo as Array<Record<string, unknown>>)
    : [];
  const hdUrl = bitrate
    .map((b) => listUrls(b.PlayAddr)[0])
    .find((u): u is string => Boolean(u));

  if (hdUrl) {
    media.push({
      kind: "video",
      label: "MP4 - HD, no watermark",
      url: hdUrl,
      ext: "mp4",
      quality: "hd",
      hasWatermark: false,
    });
  }
  if (downloadAddr) {
    media.push({
      kind: "video",
      label: hdUrl ? "MP4 - SD, no watermark" : "MP4 - No watermark",
      url: downloadAddr,
      ext: "mp4",
      quality: hdUrl ? "sd" : "hd",
      hasWatermark: false,
    });
  }
  // `playAddr` is the clean (watermark-free) playback source; `downloadAddr`
  // is TikTok's own downloadable rendition. Neither reliably carries a
  // watermark, so neither is labelled as watermarked.
  if (playAddr && playAddr !== downloadAddr) {
    media.push({
      kind: "video",
      label: "MP4 - Playback copy",
      url: playAddr,
      ext: "mp4",
      quality: "hd",
      hasWatermark: false,
    });
  }

  const audioUrl = listUrls(music.playUrl)[0];
  if (audioUrl) {
    media.push({
      kind: "audio",
      label: "MP3 - Original sound",
      url: audioUrl,
      ext: "mp3",
    });
  }

  const cover =
    listUrls({ UrlList: [video.originCover, video.cover] })[0] ??
    (typeof video.cover === "string" ? video.cover : undefined);

  const id = (typeof item.id === "string" && item.id) || extractVideoId(url) || "";

  return {
    id,
    source: "native",
    url,
    title: typeof item.desc === "string" ? item.desc : undefined,
    author: {
      handle: (author.uniqueId as string) || "tiktok",
      nickname: (author.nickname as string) || "TikTok",
      avatar:
        typeof author.avatarThumb === "string"
          ? author.avatarThumb
          : undefined,
    },
    cover: typeof cover === "string" ? cover : undefined,
    duration: typeof video.duration === "number" ? video.duration : undefined,
    stats: {
      plays: num(stats.playCount),
      likes: num(stats.diggCount),
      comments: num(stats.commentCount),
      shares: num(stats.shareCount),
    },
    createdAt: num(item.createTime),
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
