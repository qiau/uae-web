import { toneBadge, type StatusInfo } from "./status-info";
import { cn } from "@/lib/utils";

/** Status is always icon + text, never color alone. */
export function StatusBadge({ info, className }: { info: StatusInfo; className?: string }) {
  const Icon = info.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        toneBadge[info.tone],
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      {info.label}
    </span>
  );
}
