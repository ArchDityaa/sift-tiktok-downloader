"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  ChatCircleDots,
  Copy,
  CheckCircle,
  DownloadSimple,
  FileZip,
  Heart,
  ImageIcon,
  MusicNote,
  Play,
  ShareNetwork,
  ArrowUpRight,
  SealCheck,
  SpinnerGap,
  X,
} from "@/components/icons";
import type { MediaItem, TikTokResult } from "@/lib/tiktok/types";
import { formatCount, formatDate, formatDuration, sanitizeFilename } from "@/lib/format";
import { cn } from "@/lib/utils";
import { downloadImagesAsZip, downloadSequentially, triggerDownload } from "@/lib/zip";

function fileBase(result: TikTokResult): string {
  return sanitizeFilename(`${result.author.handle}-${result.id || "tiktok"}`);
}

function proxyHref(media: MediaItem, result: TikTokResult): string {
  const params = new URLSearchParams({
    url: media.url,
    filename: `${fileBase(result)}-${media.kind}.${media.ext}`,
  });
  return `/api/proxy?${params.toString()}`;
}

function mediaIcon(media: MediaItem) {
  if (media.kind === "audio") return <MusicNote size={16} weight="bold" />;
  if (media.kind === "image") return <ImageIcon size={16} weight="bold" />;
  return <Play size={16} weight="fill" />;
}

export function ResultCard({
  result,
  onReset,
  onRemove,
  compact = false,
}: {
  result: TikTokResult;
  onReset?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<null | "zip" | "all">(null);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const duration = formatDuration(result.duration);
  const posted = formatDate(result.createdAt);

  const images = result.media.filter((item) => item.kind === "image");
  const videos = result.media.filter((item) => item.kind === "video");
  const primaryVideo = videos[0];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    const data = {
      title: `@${result.author.handle} on TikTok`,
      text: result.title,
      url: result.url,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await copyLink();
    } catch {
      /* share cancelled */
    }
  }

  async function saveZip() {
    if (busy || images.length === 0) return;
    setBusy("zip");
    setZipProgress(`0 / ${images.length}`);
    try {
      await downloadImagesAsZip(
        `${fileBase(result)}-photos`,
        images.map((item) => item.url),
        (done, total) => setZipProgress(`${done} / ${total}`),
      );
    } catch {
      setZipProgress(null);
    } finally {
      setBusy(null);
      setTimeout(() => setZipProgress(null), 1200);
    }
  }

  async function saveAllVideos() {
    if (busy || videos.length === 0) return;
    setBusy("all");
    try {
      await downloadSequentially(
        videos.map((item) => ({
          url: item.url,
          name: `${fileBase(result)}-${item.quality ?? item.kind}.mp4`,
        })),
      );
    } finally {
      setBusy(null);
    }
  }

  async function savePrimaryDirect() {
    if (!primaryVideo) return;
    try {
      const res = await fetch(primaryVideo.url, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error("direct failed");
      triggerDownload(await res.blob(), `${fileBase(result)}.mp4`);
    } catch {
      window.location.href = proxyHref(primaryVideo, result);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Ready to download"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div
        className={cn(
          "grid gap-0",
          compact ? "md:grid-cols-[150px_1fr]" : "md:grid-cols-[280px_1fr]",
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-surface-2",
            compact ? "hidden md:block" : "aspect-[9/13] md:aspect-auto md:h-full",
          )}
        >
          {result.cover ? (
            // Remote CDN image, size unknown until load.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.cover}
              alt={result.title ? `Cover for ${result.title}` : `Cover by @${result.author.handle}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint">
              <ImageIcon size={28} />
            </div>
          )}
          {duration ? (
            <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 font-mono text-xs text-white">
              {duration}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.author.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-line object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-weak text-sm font-semibold text-accent">
                  {result.author.handle.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                  {result.author.nickname}
                  <SealCheck size={15} weight="fill" className="shrink-0 text-accent" />
                </p>
                <p className="truncate text-xs text-ink-muted">@{result.author.handle}</p>
              </div>
            </div>
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                aria-label="Remove from list"
                className="shrink-0 rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:text-ink"
              >
                <X size={15} weight="bold" />
              </button>
            ) : onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                New link
              </button>
            ) : null}
          </div>

          {result.title ? (
            <p className="max-h-20 overflow-hidden text-sm leading-relaxed text-ink-muted">
              {result.title}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
            {result.stats?.plays ? (
              <span className="inline-flex items-center gap-1.5">
                <Play size={13} weight="fill" /> {formatCount(result.stats.plays)} plays
              </span>
            ) : null}
            {result.stats?.likes ? (
              <span className="inline-flex items-center gap-1.5">
                <Heart size={13} weight="fill" /> {formatCount(result.stats.likes)}
              </span>
            ) : null}
            {result.stats?.comments ? (
              <span className="inline-flex items-center gap-1.5">
                <ChatCircleDots size={13} weight="fill" /> {formatCount(result.stats.comments)}
              </span>
            ) : null}
            {posted ? <span>Posted {posted}</span> : null}
          </div>

          {result.note ? (
            <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink-muted">
              {result.note}
            </p>
          ) : null}

          {images.length > 1 ? (
            <button
              type="button"
              onClick={saveZip}
              disabled={busy !== null}
              className="inline-flex items-center justify-between gap-3 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                {busy === "zip" ? (
                  <SpinnerGap size={17} weight="bold" className="animate-spin" />
                ) : (
                  <FileZip size={18} weight="bold" />
                )}
                Download all {images.length} as ZIP
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent-ink/70">
                {busy === "zip" && zipProgress ? zipProgress : "zip"}
              </span>
            </button>
          ) : null}

          {images.length <= 1 && primaryVideo ? (
            <button
              type="button"
              onClick={savePrimaryDirect}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px disabled:opacity-70"
            >
              <DownloadSimple size={17} weight="bold" />
              Save video
            </button>
          ) : null}

          {videos.length > 1 ? (
            <button
              type="button"
              onClick={saveAllVideos}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent/60 disabled:opacity-70"
            >
              {busy === "all" ? (
                <SpinnerGap size={16} weight="bold" className="animate-spin" />
              ) : (
                <DownloadSimple size={16} weight="bold" />
              )}
              Download all {videos.length} versions
            </button>
          ) : null}

          <div className="mt-auto space-y-2.5">
            {result.media.map((media, index) => (
              <div
                key={`${media.url}-${index}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3",
                  media.kind === "video"
                    ? "bg-accent text-accent-ink"
                    : "bg-canvas text-ink",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      media.kind === "video"
                        ? "bg-black/10"
                        : "bg-accent-weak text-accent",
                    )}
                  >
                    {mediaIcon(media)}
                  </span>
                  <span className="text-sm font-medium">{media.label}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
                      media.kind === "video"
                        ? "text-accent-ink/80 hover:bg-black/10 hover:text-accent-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    Open
                  </a>
                  <a
                    href={proxyHref(media, result)}
                    aria-label={`Save ${media.label}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform active:translate-y-px",
                      media.kind === "video"
                        ? "bg-black/15 text-accent-ink hover:bg-black/25"
                        : "bg-accent text-accent-ink hover:brightness-105",
                    )}
                  >
                    {media.ext}
                    <DownloadSimple size={14} weight="bold" />
                  </a>
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-line pt-4 text-xs">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition-colors hover:text-ink"
            >
              {copied ? (
                <>
                  <CheckCircle size={15} weight="fill" className="text-accent" /> Copied
                </>
              ) : (
                <>
                  <Copy size={15} weight="bold" /> Copy link
                </>
              )}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition-colors hover:text-ink"
            >
              <ShareNetwork size={15} weight="bold" /> Share
            </button>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition-colors hover:text-ink"
            >
              Open on TikTok <ArrowUpRight size={14} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
