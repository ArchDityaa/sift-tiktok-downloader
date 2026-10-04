import type { Metadata } from "next";
import { HistoryView } from "@/components/history-view";

export const metadata: Metadata = {
  title: "History",
  description:
    "The TikTok links you have opened with Sift, kept only in this browser.",
  alternates: { canonical: "/history" },
};

export default function HistoryPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Your recent links
      </h1>
      <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-ink-muted">
        Sift keeps a short list of the posts you look up so you can jump back
        to them. It lives in this browser only and never leaves your device.
      </p>
      <HistoryView />
    </section>
  );
}
