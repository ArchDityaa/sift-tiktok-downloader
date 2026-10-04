import { cn } from "@/lib/utils";

/**
 * Sift mark: a stack of narrowing strokes that reads as a sieve or funnel.
 * Simple geometric brand mark, drawn inline to stay crisp and themeable.
 */
export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-6 w-6 text-accent"
      >
        <rect width="32" height="32" rx="9" fill="currentColor" opacity="0.14" />
        <path
          d="M7 10.5h18M9.5 16h13M12 21.5h8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark ? (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Sift
        </span>
      ) : null}
    </span>
  );
}
