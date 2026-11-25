import { CircleCheck, CircleX, Info } from "lucide-react";
import { useId, useState } from "react";

import { Panel } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { approvalStatusInfo } from "@/components/common/status-info";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatRelative, shortId } from "@/lib/format";

import { APPROVAL_DECISION_COPY, type ApprovalDecision } from "../lib/decisions";
import type { SampleApproval } from "../mock";

export function DecisionPanel({
  approval,
  onDecide,
}: {
  approval: SampleApproval;
  onDecide: (decision: ApprovalDecision, comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [confirming, setConfirming] = useState<ApprovalDecision | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const commentId = useId();
  const commentErrorId = useId();
  const decided = approval.status !== "pending";

  function startDecision(decision: ApprovalDecision) {
    if (decision === "rejected" && !comment.trim()) {
      setCommentError("Add a reason so the requester knows what to change.");
      document.getElementById(commentId)?.focus();
      return;
    }
    setCommentError(null);
    setConfirming(decision);
  }

  return (
    <Panel
      title={
        <>
          {approval.service_name}
          <span className="font-mono text-sm font-normal text-muted-foreground">{shortId(approval.request_id)}</span>
        </>
      }
      actions={<StatusBadge info={approvalStatusInfo(approval.status)} />}
    >
      <div className="space-y-5 px-4 py-4 sm:px-5">
        <section aria-labelledby={`${commentId}-what`} className="space-y-1">
          <h3 id={`${commentId}-what`} className="text-sm text-muted-foreground">
            What is being approved
          </h3>
          <p className="text-sm font-medium">{approval.summary}</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
            {Object.entries(approval.request_data).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-muted-foreground">{key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Requested by</dt>
            <dd className="font-mono">{approval.requester}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Requested</dt>
            <dd>
              <time dateTime={approval.created_at} title={formatDateTime(approval.created_at)}>
                {formatRelative(approval.created_at)}
              </time>
            </dd>
          </div>
        </dl>

        <section
          aria-labelledby={`${commentId}-effect`}
          className="rounded-md border border-warning/50 bg-status-pending-bg px-3 py-2.5"
        >
          <h3 id={`${commentId}-effect`} className="flex items-center gap-1.5 text-sm font-medium text-status-pending">
            <Info className="size-4" aria-hidden />
            If you approve
          </h3>
          <p className="mt-1 text-sm">{approval.consequence}</p>
        </section>

        {!decided && (
          <>
            <div className="space-y-2">
              <Label htmlFor={commentId}>
                Comment <span className="font-normal text-muted-foreground">(required to reject)</span>
              </Label>
              <Textarea
                id={commentId}
                rows={3}
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (commentError) setCommentError(null);
                }}
                aria-invalid={Boolean(commentError)}
                aria-describedby={commentError ? commentErrorId : undefined}
              />
              {commentError && (
                <p id={commentErrorId} className="text-sm text-destructive">
                  {commentError}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => startDecision("approved")}>
                <CircleCheck aria-hidden />
                Approve request
              </Button>
              <Button variant="outline" onClick={() => startDecision("rejected")}>
                <CircleX aria-hidden />
                Reject request
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sample data: decisions here are not saved and nothing is provisioned.
            </p>
          </>
        )}
      </div>

      <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          {confirming && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{APPROVAL_DECISION_COPY[confirming].action}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirming === "approved"
                    ? approval.consequence
                    : `The request from ${approval.requester} will not go ahead. Your reason: ${comment.trim()}`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep reviewing</AlertDialogCancel>
                <Button
                  variant={confirming === "rejected" ? "destructive" : "default"}
                  onClick={() => {
                    onDecide(confirming, comment.trim());
                    setConfirming(null);
                  }}
                >
                  {APPROVAL_DECISION_COPY[confirming].action}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
