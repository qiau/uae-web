import { FlaskConical } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Honest marker for anything backed by sample data. Shown wherever the
 * backend has no endpoint yet, so nobody mistakes sample data for real data.
 */
export function SampleDataBadge({
  reason = "This part of Rheo is not connected yet. These entries are examples, not real records.",
  className,
}: {
  reason?: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            className={cn(
              "inline-flex h-5 items-center gap-1 rounded-sm border border-dashed border-border px-1.5 text-xs font-normal text-muted-foreground",
              className,
            )}
          />
        }
      >
        <FlaskConical className="size-3" aria-hidden />
        Sample data
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{reason}</TooltipContent>
    </Tooltip>
  );
}
