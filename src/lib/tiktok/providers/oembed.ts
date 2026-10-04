import { extractVideoId } from "../url";
import type { TikTokResult } from "../types";

const OAUTH = "https://www.tiktok.com/oembed";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface OembedResponse {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
}

/**
 * Last-resort fallback. TikTok's oEmbed endpoint is documented and stable
 * but only exposes the caption and a cover image, never the video file.
 * Keeps the tool useful (cover download + share card) when scraping fails.
 */
export async function extractWithOembed(
  url: string,
  signal: AbortSignal,
): Promise<TikTokResult> {
  const endpoint = new URL(OAUTH);
  endpoint.searchParams.set("url", url);

  const res = await fetch(endpoint, {
    signal,
    cache: "no-store",
    headers: { "User-Agent": UA, Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`oembed responded ${res.status}`);

  const data = (await res.json()) as OembedResponse;
  if (!data.thumbnail_url) throw new Error("oembed returned no media");

  const handle =
    data.author_url?.split("@")[1]?.replace(/\/$/, "") || "tiktok";

  return {
    id: extractVideoId(url) || "",
    source: "oembed",
    url,
    title: data.title,
    author: { handle, nickname: data.author_name || handle },
    cover: data.thumbnail_url,
    stats: {},
    media: [
      {
        kind: "image",
        label: "Cover - JPG",
        url: data.thumbnail_url,
        ext: "jpg",
      },
    ],
    partial: true,
    note: "Video file is unavailable right now. The cover image is ready to save.",
  };
}
