import { Info } from "lucide-react";
import { Link } from "react-router";

import { PageHeader, Panel } from "@/components/common/page-header";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { EmptyState } from "@/components/common/states";

import { useJobs } from "../hooks/use-jobs";
import { JobDetail } from "./job-detail";
import { JobTable } from "./job-table";

export function JobsView() {
  const { jobs, selected, selectedId, setSelectedId, notice, applyAction } = useJobs();

  return (
    <>
      <PageHeader
        title="Automation jobs"
        meta={
          <SampleDataBadge reason="Automation is not connected to Rheo yet. These jobs are examples and actions are not sent anywhere." />
        }
        description="Status, timing, and output of the automation that fulfils requests."
      />

      {notice && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {notice}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Panel title="Jobs">
          {jobs.length === 0 ? (
            <EmptyState
              title="No automation jobs yet"
              action={
                <Link to="/services" className="text-sm text-primary underline-offset-4 hover:underline">
                  Browse the service catalog
                </Link>
              }
            >
              Jobs appear here when an approved request starts automation.
            </EmptyState>
          ) : (
            <JobTable
              jobs={jobs}
              caption="Automation jobs (sample data)"
              selectedId={selectedId ?? undefined}
              onSelect={(job) => setSelectedId(job.id)}
            />
          )}
        </Panel>
        <div>
          {selected ? (
            <JobDetail key={selected.id} job={selected} onAction={(action) => applyAction(selected.id, action)} />
          ) : (
            <Panel>
              <EmptyState title="Select a job">Choose a job to see its status, timing, and log.</EmptyState>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
