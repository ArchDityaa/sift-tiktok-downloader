"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningCircle } from "@/components/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-weak text-accent">
        <WarningCircle size={24} weight="fill" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
        Something broke on this page.
      </h1>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-muted">
        An unexpected error stopped the page from finishing. You can retry it,
        or head back to the downloader.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent/60"
        >
          Back to Sift
        </Link>
      </div>
    </section>
  );
}
