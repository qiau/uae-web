import { Play, Square } from "lucide-react";
import { useState } from "react";

import { Panel } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { jobStatusInfo } from "@/components/common/status-info";
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
import { formatDateTime, formatDuration, shortId } from "@/lib/format";

import { JOB_ACTION_COPY, type JobAction } from "../lib/job-actions";
import type { SampleJob } from "../mock";

export function JobDetail({ job, onAction }: { job: SampleJob; onAction: (action: JobAction) => void }) {
  const [confirming, setConfirming] = useState<JobAction | null>(null);
  const canRun = job.status === "failed" || job.status === "cancelled";
  const canCancel = job.status === "pending" || job.status === "running";

  return (
    <Panel
      title={<span className="font-mono">{job.automation_type}</span>}
      actions={<StatusBadge info={jobStatusInfo(job.status)} />}
    >
      <dl className="divide-y text-sm">
        <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
          <dt className="text-muted-foreground">Job ID</dt>
          <dd className="font-mono text-xs">{job.id}</dd>
        </div>
        <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
          <dt className="text-muted-foreground">Request</dt>
          <dd className="font-mono">{shortId(job.request_id)}</dd>
        </div>
        <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
          <dt className="text-muted-foreground">External job</dt>
          <dd className="font-mono">{job.external_job_id ?? "Not assigned yet"}</dd>
        </div>
        <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
          <dt className="text-muted-foreground">Last run</dt>
          <dd>{job.started_at ? <time dateTime={job.started_at}>{formatDateTime(job.started_at)}</time> : "Not started"}</dd>
        </div>
        <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="tabular">
            {job.started_at ? formatDuration(job.started_at, job.finished_at) : "None yet"}
            {job.started_at && !job.finished_at && " so far"}
          </dd>
        </div>
      </dl>

      {job.error_message && (
        <p
          role="note"
          className="mx-4 mb-3 rounded-md border border-destructive/40 bg-status-failed-bg px-3 py-2 text-sm text-status-failed sm:mx-5"
        >
          {job.error_message}
        </p>
      )}

      <div className="border-t px-4 py-3 sm:px-5">
        <h3 className="mb-2 text-sm font-medium">Log</h3>
        {job.log.length === 0 ? (
          <p className="text-sm text-muted-foreground">No output yet. The log starts when the job runs.</p>
        ) : (
          <pre
            tabIndex={0}
            aria-label={`Log for ${job.automation_type}`}
            className="max-h-64 overflow-auto rounded-md bg-muted px-3 py-2 font-mono text-xs leading-relaxed"
          >
            {job.log.join("\n")}
          </pre>
        )}
      </div>

      {(canRun || canCancel) && (
        <div className="flex flex-wrap gap-2 border-t px-4 py-3 sm:px-5">
          {canRun && (
            <Button variant="outline" size="sm" onClick={() => setConfirming("run")}>
              <Play aria-hidden />
              Run job again
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={() => setConfirming("cancel")}>
              <Square aria-hidden />
              Cancel job
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          {confirming && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{JOB_ACTION_COPY[confirming].label}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {JOB_ACTION_COPY[confirming].effect(job)} Sample data: nothing will actually run or stop.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep job as is</AlertDialogCancel>
                <Button
                  variant={confirming === "cancel" ? "destructive" : "default"}
                  onClick={() => {
                    onAction(confirming);
                    setConfirming(null);
                  }}
                >
                  {JOB_ACTION_COPY[confirming].label}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
