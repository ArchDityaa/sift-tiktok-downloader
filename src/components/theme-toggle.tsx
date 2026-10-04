"use client";

import { Moon, Sun } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * The active theme is carried by the `dark` class on <html>, set by the
 * inline script in the root layout. The icon swaps purely with CSS, so this
 * component needs no state and cannot cause a hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("sift-theme", next);
    } catch {
      /* storage may be unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink",
        className,
      )}
    >
      <Sun size={17} weight="bold" className="hidden dark:block" />
      <Moon size={17} weight="bold" className="block dark:hidden" />
    </button>
  );
}
