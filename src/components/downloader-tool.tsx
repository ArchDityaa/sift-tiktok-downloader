"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clipboard, LinkIcon, SpinnerGap, WarningCircle, X } from "@/components/icons";
import type { ResolveResponse, TikTokResult } from "@/lib/tiktok/types";
import { isTikTokUrl } from "@/lib/tiktok/url";
import { addToHistory } from "@/lib/history";
import { ResultCard } from "@/components/result-card";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error" | "ready";

const EXAMPLES = [
  "https://www.tiktok.com/@tiktok/video/7106594312292453675",
];

export function DownloaderTool() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(
    async (raw?: string) => {
      const url = (raw ?? value).trim();
      if (!url) {
        setError("Paste a TikTok link to get started.");
        setStatus("error");
        inputRef.current?.focus();
        return;
      }
      if (!isTikTokUrl(url)) {
        setError(
          "That does not look like a TikTok link. It should start with tiktok.com.",
        );
        setStatus("error");
        return;
      }

      setStatus("loading");
      setError(null);
      setResult(null);

      try {
        const res = await fetch("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = (await res.json()) as ResolveResponse;

        if (!res.ok || !data.ok || !data.result) {
          setError(data.error || "We could not read this post. Try another link.");
          setStatus("error");
          return;
        }

        setResult(data.result);
        setStatus("ready");
        addToHistory(data.result);
        requestAnimationFrame(() =>
          outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      } catch {
        setError("Network error. Check your connection and try again.");
        setStatus("error");
      }
    },
    [value],
  );

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setValue(text);
        await submit(text);
      }
    } catch {
      inputRef.current?.focus();
    }
  }

  function reset() {
    setValue("");
    setResult(null);
    setError(null);
    setStatus("idle");
    inputRef.current?.focus();
  }

  return (
    <div id="tool" className="scroll-mt-24">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="relative"
      >
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl border bg-surface p-2 transition-colors sm:flex-row sm:items-center",
            status === "error" ? "border-red-500/60" : "border-line focus-within:border-accent/70",
          )}
        >
          <span className="hidden pl-2 text-ink-faint sm:block">
            <LinkIcon size={20} weight="bold" />
          </span>
          <label htmlFor="tiktok-url" className="sr-only">
            TikTok video URL
          </label>
          <input
            ref={inputRef}
            id="tiktok-url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste a TikTok link here"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (status === "error") setStatus("idle");
            }}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />

          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setError(null);
                setStatus("idle");
                inputRef.current?.focus();
              }}
              aria-label="Clear input"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-ink sm:inline-flex"
            >
              <X size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={paste}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <Clipboard size={16} weight="bold" /> Paste
            </button>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px disabled:opacity-70 sm:min-w-[148px]"
          >
            {status === "loading" ? (
              <>
                <SpinnerGap size={17} weight="bold" className="animate-spin" />
                Reading
              </>
            ) : (
              "Get video"
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {status === "error" && error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-3 flex items-start gap-2 text-sm text-red-500"
          >
            <WarningCircle size={17} weight="fill" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>

      {status === "idle" && !error ? (
        <p className="mt-3 text-xs text-ink-faint">
          Works with public videos and photo posts. Example:{" "}
          <button
            type="button"
            onClick={() => setValue(EXAMPLES[0])}
            className="text-ink-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
          >
            a @tiktok post
          </button>
        </p>
      ) : null}

      <div ref={outputRef} className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {status === "loading" ? <LoadingCard key="loading" /> : null}
          {status === "ready" && result ? (
            <div key="result" className="mt-8">
              <ResultCard result={result} onReset={reset} />
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface"
      aria-hidden="true"
    >
      <div className="grid gap-0 md:grid-cols-[300px_1fr]">
        <div className="aspect-[9/13] w-full bg-surface-2 md:aspect-auto md:h-full">
          <div className="h-full w-full animate-pulse bg-line/40" />
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-line/50" />
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-line/50" />
              <div className="h-3 w-20 animate-pulse rounded bg-line/40" />
            </div>
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-line/40" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-line/40" />
          <div className="space-y-2.5 pt-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-xl bg-line/40"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
