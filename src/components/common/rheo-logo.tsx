import { cn } from "@/lib/utils";

/** Rheo mark: three flowing lines. Uses currentColor so it follows tokens. */
export function RheoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <path
        d="M3 8c3-2.5 5.5 2.5 9 0s4.5-2.5 9-0.5M3 12.5c3-2.5 5.5 2.5 9 0s4.5-2.5 9-0.5M3 17c3-2.5 5.5 2.5 9 0s4.5-2.5 9-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RheoWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <RheoMark className="text-primary" />
      <span className="text-base font-semibold tracking-tight">Rheo</span>
    </span>
  );
}
