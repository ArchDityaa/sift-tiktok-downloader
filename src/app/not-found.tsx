import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-faint">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        That page slipped through the sieve.
      </h1>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-muted">
        The page you asked for does not exist. Head back and paste a TikTok
        link instead.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px"
      >
        Back to Sift
      </Link>
    </section>
  );
}
