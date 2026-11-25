import { Link } from "react-router";

import { Panel } from "@/components/common/page-header";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { JobTable, sampleJobs } from "@/features/jobs";

const RECENT_COUNT = 5;

export function RecentJobs() {
  const jobs = [...sampleJobs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, RECENT_COUNT);
  return (
    <Panel
      title={
        <>
          Automation jobs <SampleDataBadge />
        </>
      }
      actions={
        <Link to="/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View all jobs
        </Link>
      }
    >
      <JobTable jobs={jobs} caption="Recent automation jobs (sample data)" />
    </Panel>
  );
}
