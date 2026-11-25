import { CircleAlert, Inbox, ShieldAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, describeError } from "@/lib/api-errors";
import { cn } from "@/lib/utils";

function StateMessage({
  icon: Icon,
  title,
  children,
  action,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "error";
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn("flex flex-col items-start gap-3 px-4 py-8 sm:px-6", className)}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className={cn("mt-0.5 size-5 shrink-0", tone === "error" ? "text-destructive" : "text-muted-foreground")}
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          {children && <div className="max-w-prose text-sm text-muted-foreground">{children}</div>}
        </div>
      </div>
      {action && <div className="pl-8">{action}</div>}
    </div>
  );
}

export function EmptyState(props: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <StateMessage icon={Inbox} {...props} />;
}

export function PermissionDenied({ what }: { what: string }) {
  return (
    <StateMessage icon={ShieldAlert} title={`You do not have access to ${what}`}>
      Your account is missing the role this needs. Ask an IT administrator to grant access.
    </StateMessage>
  );
}

/** Error state for a failed query. 403 shows the permission-denied state instead. */
export function QueryError({ error, what, onRetry }: { error: unknown; what: string; onRetry?: () => void }) {
  if (error instanceof ApiError && error.status === 403) return <PermissionDenied what={what} />;
  return (
    <StateMessage
      icon={CircleAlert}
      tone="error"
      title={`Could not load ${what}`}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    >
      {describeError(error)}
    </StateMessage>
  );
}

/** Placeholder rows shaped like the table that is loading. */
export function TableSkeleton({ rows = 5, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 px-4 py-4 sm:px-6">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  );
}
