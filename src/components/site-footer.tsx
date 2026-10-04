import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Tool",
    links: [
      { href: "/", label: "Downloader" },
      { href: "/history", label: "History" },
      { href: "/#how", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            A small, no-nonsense utility for saving public TikTok media. No
            account, no fee, no server-side copy of your files.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Sift is an independent tool and is not affiliated with TikTok or ByteDance.</p>
          <p>Built for personal use. Respect creators and their rights.</p>
        </div>
      </div>
    </footer>
  );
}
