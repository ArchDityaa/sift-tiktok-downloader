import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-faint">
        Last updated {updated}
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">{intro}</p>
      <div className="mt-10 space-y-8">{children}</div>
    </section>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </div>
  );
}
