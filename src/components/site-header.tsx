import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/history", label: "History" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Sift home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            History
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
