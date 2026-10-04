export type MediaKind = "video" | "audio" | "image";

export interface MediaItem {
  kind: MediaKind;
  /** Human label shown on the download button, e.g. "MP4 - No watermark". */
  label: string;
  url: string;
  /** File extension without the dot: mp4, mp3, jpg. */
  ext: string;
  quality?: "hd" | "sd";
  hasWatermark?: boolean;
}

export interface TikTokAuthor {
  handle: string;
  nickname: string;
  avatar?: string;
}

export interface TikTokStats {
  plays?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface TikTokResult {
  id: string;
  /** Which extractor produced this result. */
  source: string;
  /** Canonical-ish source URL that was submitted. */
  url: string;
  title?: string;
  author: TikTokAuthor;
  cover?: string;
  duration?: number;
  stats?: TikTokStats;
  /** Unix seconds. */
  createdAt?: number;
  media: MediaItem[];
  /** True when only metadata (cover) could be recovered. */
  partial?: boolean;
  note?: string;
}

export interface ResolveResponse {
  ok: boolean;
  result?: TikTokResult;
  error?: string;
}
