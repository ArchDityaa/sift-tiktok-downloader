"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowClockwise,
  Clipboard,
  DownloadSimple,
  LinkIcon,
  ListChecks,
  SpinnerGap,
  Stack,
  Trash,
  WarningCircle,
  X,
} from "@/components/icons";
import type { ResolveResponse, TikTokResult } from "@/lib/tiktok/types";
import { parseManyUrls } from "@/lib/tiktok/url";
import { addToHistory } from "@/lib/history";
import { sanitizeFilename } from "@/lib/format";
import { ResultCard } from "@/components/result-card";
import { cn } from "@/lib/utils";
import { downloadSequentially } from "@/lib/zip";

type JobStatus = "waiting" | "loading" | "ready" | "error";

interface Job {
  id: string;
  url: string;
  status: JobStatus;
  result?: TikTokResult;
  error?: string;
}

interface QueueItem {
  id: string;
  url: string;
}

const MAX_BATCH = 20;
const CONCURRENCY = 3;

const EXAMPLES = [
  "https://www.tiktok.com/@tiktok/video/7106594312292453675",
];

export function DownloaderTool() {
  const [text, setText] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [invalidTokens, setInvalidTokens] = useState<string[]>([]);
  const [busyAll, setBusyAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  // Queue is driven by refs so the runner never needs to read React state.
  // This keeps concurrency correct (even under StrictMode) and avoids
  // setState-in-effect.
  const queueRef = useRef<QueueItem[]>([]);
  const activeRef = useRef(0);
  const scheduleRef = useRef<(() => void) | null>(null);

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }, []);

  const runResolve = useCallback(
    async (id: string, url: string) => {
      try {
        const res = await fetch("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = (await res.json()) as ResolveResponse;
        if (!res.ok || !data.ok || !data.result) {
          updateJob(id, {
            status: "error",
            error: data.error || "Could not read this post.",
          });
        } else {
          updateJob(id, { status: "ready", result: data.result });
          addToHistory(data.result);
        }
      } catch {
        updateJob(id, {
          status: "error",
          error: "Network error. Check your connection and retry.",
        });
      } finally {
        activeRef.current = Math.max(0, activeRef.current - 1);
        scheduleRef.current?.();
      }
    },
    [updateJob],
  );

  const pump = useCallback(() => {
    while (activeRef.current < CONCURRENCY && queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      activeRef.current += 1;
      updateJob(item.id, { status: "loading" });
      void runResolve(item.id, item.url);
    }
  }, [runResolve, updateJob]);

  // Keep the latest pump reachable from the runner's completion callback
  // without reading it during render.
  useEffect(() => {
    scheduleRef.current = pump;
    return () => {
      scheduleRef.current = null;
    };
  }, [pump]);

  const stats = useMemo(() => {
    let ready = 0;
    let loading = 0;
    let waiting = 0;
    let error = 0;
    for (const job of jobs) {
      if (job.status === "ready") ready += 1;
      else if (job.status === "loading") loading += 1;
      else if (job.status === "waiting") waiting += 1;
      else error += 1;
    }
    return { ready, loading, waiting, error };
  }, [jobs]);

  function enqueue(items: QueueItem[]) {
    if (items.length === 0) return;
    setJobs((prev) => {
      const existing = new Set(prev.map((job) => job.url));
      const additions = items
        .filter((item) => !existing.has(item.url))
        .map((item) => ({ ...item, status: "waiting" as JobStatus }));
      return [...prev, ...additions];
    });
    queueRef.current.push(...items);
    pump();
  }

  function submit() {
    setFormError(null);
    setInvalidTokens([]);

    const { valid, invalid } = parseManyUrls(text);
    if (invalid.length > 0) setInvalidTokens(invalid.slice(0, 5));
    if (valid.length === 0) {
      setFormError("Add at least one valid TikTok link. Links start with tiktok.com.");
      textareaRef.current?.focus();
      return;
    }

    const room = MAX_BATCH - jobs.length;
    if (room <= 0) {
      setFormError(`The list is full at ${MAX_BATCH} links. Clear some to add more.`);
      return;
    }

    const accepted = valid.slice(0, room);
    if (valid.length > room) {
      setFormError(
        `Only the first ${room} links were added. The list caps at ${MAX_BATCH}.`,
      );
    }

    idRef.current += 1;
    const items: QueueItem[] = accepted.map((url, index) => ({
      id: `job-${idRef.current}-${index}`,
      url,
    }));

    enqueue(items);
    setText("");
    requestAnimationFrame(() =>
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  async function paste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText((prev) => (prev ? `${prev}\n${clip}` : clip));
    } catch {
      textareaRef.current?.focus();
    }
  }

  function retryJob(id: string, url: string) {
    updateJob(id, { status: "waiting", error: undefined });
    queueRef.current.push({ id, url });
    pump();
  }

  function removeJob(id: string) {
    queueRef.current = queueRef.current.filter((item) => item.id !== id);
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }

  function clearAll() {
    queueRef.current = [];
    setJobs([]);
    setFormError(null);
    setInvalidTokens([]);
    textareaRef.current?.focus();
  }

  async function downloadAllVideos() {
    const ready = jobs.filter((job) => job.status === "ready" && job.result);
    const items = ready.flatMap((job) => {
      const result = job.result!;
      const video = result.media.find((item) => item.kind === "video");
      if (!video) return [];
      return [
        {
          url: video.url,
          name: `${sanitizeFilename(`${result.author.handle}-${result.id || "tiktok"}`)}.mp4`,
        },
      ];
    });
    if (items.length === 0) return;
    setBusyAll(true);
    try {
      await downloadSequentially(items);
    } finally {
      setBusyAll(false);
    }
  }

  const videoCount = jobs.filter(
    (job) => job.status === "ready" && job.result?.media.some((m) => m.kind === "video"),
  ).length;

  return (
    <div id="tool" className="scroll-mt-24">
      <div
        className={cn(
          "rounded-2xl border bg-surface p-2 transition-colors",
          formError ? "border-red-500/60" : "border-line focus-within:border-accent/70",
        )}
      >
        <div className="flex items-start gap-2">
          <span className="hidden pl-2 pt-3 text-ink-faint sm:block">
            <LinkIcon size={20} weight="bold" />
          </span>
          <label htmlFor="tiktok-url" className="sr-only">
            TikTok links, one per line
          </label>
          <textarea
            ref={textareaRef}
            id="tiktok-url"
            name="urls"
            rows={jobs.length > 0 ? 2 : 3}
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste one or more TikTok links, one per line"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (formError) setFormError(null);
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            className="min-w-0 flex-1 resize-y bg-transparent px-3 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
          <button
            type="button"
            onClick={paste}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <Clipboard size={16} weight="bold" /> Paste
          </button>
          {text ? (
            <button
              type="button"
              onClick={() => {
                setText("");
                setFormError(null);
                textareaRef.current?.focus();
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <X size={16} weight="bold" /> Clear
            </button>
          ) : null}

          <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            {jobs.length} / {MAX_BATCH}
          </span>

          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px"
          >
            {jobs.length > 0 ? "Add links" : "Get videos"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {formError ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-3 flex items-start gap-2 text-sm text-red-500"
          >
            <WarningCircle size={17} weight="fill" className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>

      {invalidTokens.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-ink-faint">
          <WarningCircle size={15} weight="fill" className="mt-0.5 shrink-0" />
          <span>
            Skipped {invalidTokens.length} entry that
            {invalidTokens.length === 1 ? " is" : " are"} not a TikTok link:{" "}
            <span className="text-ink-muted">{invalidTokens.join(", ")}</span>
          </span>
        </p>
      ) : null}

      {jobs.length === 0 && !formError ? (
        <p className="mt-3 text-xs text-ink-faint">
          Works with public videos and photo posts. Example:{" "}
          <button
            type="button"
            onClick={() => setText(EXAMPLES[0])}
            className="text-ink-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
          >
            a @tiktok post
          </button>
        </p>
      ) : null}

      <div ref={outputRef} className="scroll-mt-24">
        {jobs.length > 0 ? (
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <ListChecks size={18} weight="bold" className="text-accent" />
                {stats.ready} ready
              </span>
              {stats.loading > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-ink-muted">
                  <SpinnerGap size={15} weight="bold" className="animate-spin" />
                  {stats.loading} reading
                </span>
              ) : null}
              {stats.waiting > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-ink-muted">
                  <Stack size={15} weight="bold" /> {stats.waiting} queued
                </span>
              ) : null}
              {stats.error > 0 ? (
                <span className="text-red-500">{stats.error} failed</span>
              ) : null}

              {videoCount > 1 ? (
                <button
                  type="button"
                  onClick={downloadAllVideos}
                  disabled={busyAll}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px disabled:opacity-70"
                >
                  {busyAll ? (
                    <SpinnerGap size={14} weight="bold" className="animate-spin" />
                  ) : (
                    <DownloadSimple size={14} weight="bold" />
                  )}
                  Download all videos
                </button>
              ) : null}

              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                <Trash size={13} weight="bold" /> Clear list
              </button>
            </div>

            <ul className="mt-4 space-y-4">
              <AnimatePresence initial={false}>
                {jobs.map((job) => (
                  <motion.li
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  >
                    {job.status === "ready" && job.result ? (
                      <ResultCard result={job.result} onRemove={() => removeJob(job.id)} compact />
                    ) : (
                      <JobRow
                        url={job.url}
                        status={job.status}
                        error={job.error}
                        onRetry={() => retryJob(job.id, job.url)}
                        onRemove={() => removeJob(job.id)}
                      />
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function JobRow({
  url,
  status,
  error,
  onRetry,
  onRemove,
}: {
  url: string;
  status: JobStatus;
  error?: string;
  onRetry: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3.5",
        status === "error" ? "border-red-500/40 bg-surface" : "border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          status === "error" ? "bg-red-500/10 text-red-500" : "bg-accent-weak text-accent",
        )}
      >
        {status === "loading" ? (
          <SpinnerGap size={17} weight="bold" className="animate-spin" />
        ) : status === "error" ? (
          <WarningCircle size={17} weight="fill" />
        ) : (
          <Stack size={17} weight="bold" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-muted">{url}</p>
        <p className="text-xs text-ink-faint">
          {status === "loading"
            ? "Reading the post"
            : status === "waiting"
              ? "Waiting in queue"
              : error || "Failed"}
        </p>
      </div>

      {status === "error" ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowClockwise size={14} weight="bold" /> Retry
        </button>
      ) : null}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from list"
        className="shrink-0 rounded-full p-2 text-ink-faint transition-colors hover:text-ink"
      >
        <X size={15} weight="bold" />
      </button>
    </div>
  );
}
