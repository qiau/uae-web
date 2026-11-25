import { useState } from "react";
import { useSearchParams } from "react-router";

import { sampleApprovals } from "../mock";
import { APPROVAL_DECISION_COPY, type ApprovalDecision, type ApprovalFilter } from "../lib/decisions";

export function useApprovals() {
  const [searchParams] = useSearchParams();
  const [approvals, setApprovals] = useState(sampleApprovals);
  const [filter, setFilter] = useState<ApprovalFilter>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id") ?? sampleApprovals[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  const visible = approvals.filter((approval) =>
    filter === "pending" ? approval.status === "pending" : approval.status !== "pending",
  );
  const selected = approvals.find((approval) => approval.id === selectedId) ?? null;
  const pendingCount = approvals.filter((approval) => approval.status === "pending").length;

  function decide(id: string, decision: ApprovalDecision) {
    setApprovals((current) => current.map((item) => (item.id === id ? { ...item, status: decision } : item)));
    setNotice(`${APPROVAL_DECISION_COPY[decision].done}. Sample data: this decision was not saved.`);
    const nextPending = approvals.find((item) => item.status === "pending" && item.id !== id);
    if (nextPending) setSelectedId(nextPending.id);
  }

  function decideSelected(decision: ApprovalDecision) {
    if (selected) decide(selected.id, decision);
  }

  return {
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    notice,
    visible,
    selected,
    pendingCount,
    decideSelected,
  };
}
