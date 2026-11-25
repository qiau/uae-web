import type { ApprovalStatus } from "@/types/api";

export type ApprovalDecision = Exclude<ApprovalStatus, "pending">;
export type ApprovalFilter = "pending" | "decided";

export const APPROVAL_DECISION_COPY: Record<ApprovalDecision, { action: string; done: string }> = {
  approved: { action: "Approve request", done: "Request approved" },
  rejected: { action: "Reject request", done: "Request rejected" },
};
