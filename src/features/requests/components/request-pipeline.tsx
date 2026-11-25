import { requestStatusInfo, toneText } from "@/components/common/status-info";
import { cn } from "@/lib/utils";
import type { RequestStatus, ServiceRequest } from "@/types/api";

/** The happy path a request moves through, in order. */
const STAGES: RequestStatus[] = ["submitted", "approved", "in_progress", "completed"];
/** Statuses that leave the main path. */
const EXITS: RequestStatus[] = ["rejected", "failed", "cancelled"];

function countByStatus(requests: ServiceRequest[]) {
  const counts = new Map<string, number>();
  for (const request of requests) counts.set(request.status, (counts.get(request.status) ?? 0) + 1);
  return counts;
}

/**
 * Pipeline strip: counts per stage joined by a flow line. This is one of the
 * two places the flow motif is used, because it shows real progression.
 */
export function RequestPipeline({ requests }: { requests: ServiceRequest[] }) {
  const counts = countByStatus(requests);

  return (
    <div className="space-y-4 px-4 py-5 sm:px-5">
      <ol className="grid grid-cols-2 gap-y-5 sm:grid-cols-4" aria-label="Requests by stage">
        {STAGES.map((status, index) => {
          const info = requestStatusInfo(status);
          const Icon = info.icon;
          const count = counts.get(status) ?? 0;
          const last = index === STAGES.length - 1;
          return (
            <li key={status} className="relative flex flex-col gap-2 pr-4">
              <div className="flex items-center">
                <span
                  className={cn(
                    "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-card",
                    count > 0 ? toneText[info.tone] : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                {!last && (
                  <span aria-hidden className={cn("ml-2 hidden h-px flex-1 sm:block", count > 0 ? "bg-flow" : "bg-border")} />
                )}
              </div>
              <div>
                <p className="tabular text-2xl leading-none font-semibold">{count}</p>
                <p className="mt-1 text-sm text-muted-foreground">{info.label}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm">
        {EXITS.map((status) => {
          const info = requestStatusInfo(status);
          const Icon = info.icon;
          return (
            <div key={status} className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className={cn("size-3.5", toneText[info.tone])} aria-hidden />
              <dt>{info.label}</dt>
              <dd className="tabular font-medium text-foreground">{counts.get(status) ?? 0}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
