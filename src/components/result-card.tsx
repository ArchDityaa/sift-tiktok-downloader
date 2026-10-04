"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  ChatCircleDots,
  Copy,
  CheckCircle,
  DownloadSimple,
  Heart,
  ImageIcon,
  MusicNote,
  Play,
  ShareNetwork,
  ArrowUpRight,
  SealCheck,
} from "@/components/icons";
import type { MediaItem, TikTokResult } from "@/lib/tiktok/types";
import { formatCount, formatDate, formatDuration, sanitizeFilename } from "@/lib/format";
import { cn } from "@/lib/utils";

function proxyHref(media: MediaItem, result: TikTokResult): string {
  const base = sanitizeFilename(
    `${result.author.handle}-${result.id || "tiktok"}-${media.kind}`,
  );
  const params = new URLSearchParams({
    url: media.url,
    filename: `${base}.${media.ext}`,
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
}: {
  result: TikTokResult;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const duration = formatDuration(result.duration);
  const posted = formatDate(result.createdAt);

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Ready to download"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div className="grid gap-0 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-[9/13] w-full overflow-hidden bg-surface-2 md:aspect-auto md:h-full">
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

        <div className="flex flex-col gap-5 p-5 sm:p-6">
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
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
            >
              New link
            </button>
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
                    <DownloadSimple
                      size={14}
                      weight="bold"
                      className="transition-transform group-hover:translate-y-0.5"
                    />
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
