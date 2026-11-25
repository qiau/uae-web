import { StatusBadge } from "@/components/common/status-badge";
import { jobStatusInfo } from "@/components/common/status-info";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatDuration, formatRelative, shortId } from "@/lib/format";

import type { SampleJob } from "../mock";

export function JobTable({
  jobs,
  caption,
  selectedId,
  onSelect,
}: {
  jobs: SampleJob[];
  caption: string;
  selectedId?: string;
  onSelect?: (job: SampleJob) => void;
}) {
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4 sm:pl-5">Job</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last run</TableHead>
          <TableHead className="pr-4 sm:pr-5">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id} data-state={selectedId === job.id ? "selected" : undefined}>
            <TableCell className="pl-4 sm:pl-5">
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(job)}
                  aria-pressed={selectedId === job.id}
                  className="rounded-sm font-mono text-sm text-primary underline-offset-4 hover:underline"
                >
                  {shortId(job.id)}
                </button>
              ) : (
                <span className="font-mono text-sm">{shortId(job.id)}</span>
              )}
            </TableCell>
            <TableCell className="font-mono text-sm">{job.automation_type}</TableCell>
            <TableCell>
              <StatusBadge info={jobStatusInfo(job.status)} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {job.started_at ? (
                <time dateTime={job.started_at} title={formatDateTime(job.started_at)}>
                  {formatRelative(job.started_at)}
                </time>
              ) : (
                "Not started"
              )}
            </TableCell>
            <TableCell className="tabular pr-4 text-muted-foreground sm:pr-5">
              {job.started_at ? formatDuration(job.started_at, job.finished_at) : "None yet"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
