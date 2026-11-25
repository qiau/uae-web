import { Ban, CircleCheck, CircleDashed, CircleX, Clock, LoaderCircle, TriangleAlert, type LucideIcon } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceRequest } from "@/types/api";

type StepState = "done" | "current" | "upcoming" | "stopped";

type Step = {
  key: string;
  title: string;
  state: StepState;
  icon: LucideIcon;
  /** Text tone class for the node when it is current or stopped. */
  tone?: string;
  note?: string;
  time?: { label: string; iso: string };
};

const APPROVAL_NOTE = "Approval is not connected to Rheo yet, so requests stay at this step for now.";

/**
 * Derives progress steps from the request status. The backend has no history
 * endpoint, so only the creation time and the last update time are known.
 */
function deriveSteps(request: ServiceRequest): Step[] {
  const created = { label: "Created", iso: request.created_at };
  const updated = { label: "Last updated", iso: request.updated_at };
  const submitted: Step = { key: "submitted", title: "Submitted", state: "done", icon: CircleCheck, time: created };

  const upcoming = (key: string, title: string): Step => ({ key, title, state: "upcoming", icon: CircleDashed });
  const done = (key: string, title: string): Step => ({ key, title, state: "done", icon: CircleCheck });

  switch (request.status) {
    case "submitted":
      return [
        submitted,
        {
          key: "approval",
          title: "Waiting for approval",
          state: "current",
          icon: Clock,
          tone: "text-status-pending",
          note: APPROVAL_NOTE,
        },
        upcoming("in_progress", "In progress"),
        upcoming("completed", "Completed"),
      ];
    case "approved":
      return [
        submitted,
        { ...done("approval", "Approved"), time: updated },
        { key: "in_progress", title: "Waiting to start", state: "current", icon: Clock, tone: "text-status-pending" },
        upcoming("completed", "Completed"),
      ];
    case "rejected":
      return [
        submitted,
        {
          key: "approval",
          title: "Rejected",
          state: "stopped",
          icon: CircleX,
          tone: "text-status-rejected",
          time: updated,
          note: "This request will not go ahead. Create a new request if you still need the service.",
        },
      ];
    case "in_progress":
      return [
        submitted,
        done("approval", "Approved"),
        { key: "in_progress", title: "In progress", state: "current", icon: LoaderCircle, tone: "text-status-running", time: updated },
        upcoming("completed", "Completed"),
      ];
    case "completed":
      return [
        submitted,
        done("approval", "Approved"),
        done("in_progress", "In progress"),
        { key: "completed", title: "Completed", state: "done", icon: CircleCheck, time: updated },
      ];
    case "failed":
      return [
        submitted,
        done("approval", "Approved"),
        {
          key: "in_progress",
          title: "Failed",
          state: "stopped",
          icon: TriangleAlert,
          tone: "text-status-failed",
          time: updated,
          note: "The work could not be finished. IT can see the details of what went wrong.",
        },
      ];
    case "cancelled":
      return [submitted, { key: "cancelled", title: "Cancelled", state: "stopped", icon: Ban, tone: "text-status-cancelled", time: updated }];
    default:
      return [submitted, { key: "unknown", title: `Status: ${request.status}`, state: "current", icon: Clock, time: updated }];
  }
}

const STATE_LABEL: Record<StepState, string> = {
  done: "Done",
  current: "Current step",
  upcoming: "Not started",
  stopped: "Stopped here",
};

/**
 * Vertical progress timeline. The connecting line uses the flow color up to
 * the current step and the border color after it.
 */
export function RequestTimeline({ request }: { request: ServiceRequest }) {
  const steps = deriveSteps(request);

  return (
    <ol className="relative" aria-label="Request progress">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const last = index === steps.length - 1;
        const nextReached = !last && steps[index + 1].state !== "upcoming";
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn("absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full", nextReached ? "bg-flow" : "bg-border")}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                step.state === "done" && "border-flow text-flow",
                step.state === "upcoming" && "border-border text-muted-foreground",
                (step.state === "current" || step.state === "stopped") && cn("border-current", step.tone),
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn("text-sm font-medium", step.state === "upcoming" && "text-muted-foreground")}>
                {step.title}
                <span className="sr-only">, {STATE_LABEL[step.state]}</span>
              </p>
              {step.time && (
                <p className="text-sm text-muted-foreground">
                  {step.time.label} <time dateTime={step.time.iso}>{formatDateTime(step.time.iso)}</time>
                </p>
              )}
              {step.note && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{step.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
