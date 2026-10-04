"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ClockCounterClockwise, DownloadSimple, Trash, X } from "@/components/icons";
import { readHistory, removeFromHistory, clearHistory, type HistoryRecord } from "@/lib/history";

export function HistoryView() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reading browser storage after mount keeps server and client markup in
    // sync, then fills the list from local storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecords(readHistory());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="mt-10 space-y-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-20 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-weak text-accent">
          <ClockCounterClockwise size={22} weight="bold" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-ink">Nothing saved yet</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Links you open land here so you can find them again. They are stored
          only in this browser.
        </p>
        <Link
          href="/#tool"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px"
        >
          <DownloadSimple size={16} weight="bold" /> Save a video
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {records.length} {records.length === 1 ? "link" : "links"} in this browser
        </p>
        <button
          type="button"
          onClick={() => setRecords(clearHistory())}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <Trash size={14} weight="bold" /> Clear all
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        <AnimatePresence initial={false}>
          {records.map((record) => (
            <motion.li
              key={record.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-3"
            >
              {record.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={record.cover}
                  alt=""
                  className="h-16 w-12 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="h-16 w-12 shrink-0 rounded-lg bg-surface-2" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {record.title || `@${record.handle}`}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  @{record.handle} · {new Date(record.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <a
                href={record.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink sm:inline-flex"
              >
                Open
              </a>
              <button
                type="button"
                onClick={() => setRecords(removeFromHistory(record.id))}
                aria-label="Remove from history"
                className="shrink-0 rounded-full p-2 text-ink-faint transition-colors hover:text-ink"
              >
                <X size={16} weight="bold" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
