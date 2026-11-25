import { Stamp, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

import { Panel } from "@/components/common/page-header";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { sampleApprovals } from "@/features/approvals";
import { sampleJobs } from "@/features/jobs";
import { formatDateTime, formatRelative } from "@/lib/format";

export function NeedsAction() {
  const pending = sampleApprovals.filter((approval) => approval.status === "pending");
  const failed = sampleJobs.filter((job) => job.status === "failed");

  return (
    <Panel
      title={
        <>
          Needs your action <SampleDataBadge />
        </>
      }
      description="Approvals waiting on you and automation that needs a decision."
    >
      <ul className="divide-y">
        {pending.map((approval) => (
          <li key={approval.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
            <Stamp className="size-4 shrink-0 text-status-pending" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Approve {approval.service_name.toLowerCase()} for <span className="font-mono">{approval.requester}</span>
              </p>
              <p className="truncate text-sm text-muted-foreground">{approval.summary}</p>
            </div>
            <time
              dateTime={approval.created_at}
              title={formatDateTime(approval.created_at)}
              className="text-sm text-muted-foreground"
            >
              Requested {formatRelative(approval.created_at)}
            </time>
            <Link to={`/approvals?id=${approval.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Review request
            </Link>
          </li>
        ))}
        {failed.map((job) => (
          <li key={job.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
            <TriangleAlert className="size-4 shrink-0 text-status-failed" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Job <span className="font-mono">{job.automation_type}</span> failed
              </p>
              <p className="truncate text-sm text-muted-foreground">{job.error_message}</p>
            </div>
            <Link to={`/jobs?id=${job.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              View job log
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
