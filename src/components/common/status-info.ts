import {
  Ban,
  CircleCheck,
  CircleCheckBig,
  CircleX,
  Clock,
  LoaderCircle,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import type { ApprovalStatus, JobStatus, RequestStatus } from "@/types/api";

/** Semantic status tones, backed by --status-* tokens in index.css. */
export type StatusTone = "pending" | "approved" | "rejected" | "running" | "succeeded" | "failed" | "cancelled";

// Full class names so Tailwind can see them.
export const toneText: Record<StatusTone, string> = {
  pending: "text-status-pending",
  approved: "text-status-approved",
  rejected: "text-status-rejected",
  running: "text-status-running",
  succeeded: "text-status-succeeded",
  failed: "text-status-failed",
  cancelled: "text-status-cancelled",
};

export const toneBadge: Record<StatusTone, string> = {
  pending: "bg-status-pending-bg text-status-pending",
  approved: "bg-status-approved-bg text-status-approved",
  rejected: "bg-status-rejected-bg text-status-rejected",
  running: "bg-status-running-bg text-status-running",
  succeeded: "bg-status-succeeded-bg text-status-succeeded",
  failed: "bg-status-failed-bg text-status-failed",
  cancelled: "bg-status-cancelled-bg text-status-cancelled",
};

export type StatusInfo = {
  tone: StatusTone;
  label: string;
  icon: LucideIcon;
};

const REQUEST_STATUS: Record<RequestStatus, StatusInfo> = {
  submitted: { tone: "pending", label: "Submitted", icon: Clock },
  approved: { tone: "approved", label: "Approved", icon: CircleCheck },
  rejected: { tone: "rejected", label: "Rejected", icon: CircleX },
  in_progress: { tone: "running", label: "In progress", icon: LoaderCircle },
  completed: { tone: "succeeded", label: "Completed", icon: CircleCheckBig },
  failed: { tone: "failed", label: "Failed", icon: TriangleAlert },
  cancelled: { tone: "cancelled", label: "Cancelled", icon: Ban },
};

const JOB_STATUS: Record<JobStatus, StatusInfo> = {
  pending: { tone: "pending", label: "Queued", icon: Clock },
  running: { tone: "running", label: "Running", icon: LoaderCircle },
  succeeded: { tone: "succeeded", label: "Succeeded", icon: CircleCheckBig },
  failed: { tone: "failed", label: "Failed", icon: TriangleAlert },
  cancelled: { tone: "cancelled", label: "Cancelled", icon: Ban },
};

const APPROVAL_STATUS: Record<ApprovalStatus, StatusInfo> = {
  pending: { tone: "pending", label: "Awaiting decision", icon: Clock },
  approved: { tone: "approved", label: "Approved", icon: CircleCheck },
  rejected: { tone: "rejected", label: "Rejected", icon: CircleX },
};

function humanize(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function requestStatusInfo(status: string): StatusInfo {
  return (
    REQUEST_STATUS[status as RequestStatus] ?? {
      tone: "cancelled",
      label: humanize(status),
      icon: Clock,
    }
  );
}

export function jobStatusInfo(status: JobStatus): StatusInfo {
  return JOB_STATUS[status];
}

export function approvalStatusInfo(status: ApprovalStatus): StatusInfo {
  return APPROVAL_STATUS[status];
}
