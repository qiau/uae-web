import { Plus } from "lucide-react";
import { Link } from "react-router";

import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button-variants";

import { NeedsAction } from "./needs-action";
import { PipelineAndRecent } from "./pipeline-and-recent";
import { RecentActivity } from "./recent-activity";
import { RecentJobs } from "./recent-jobs";

export function DashboardView() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What needs your attention, and where your requests and automation stand."
        actions={
          <Link to="/requests/new" className={buttonVariants()}>
            <Plus aria-hidden />
            New request
          </Link>
        }
      />
      <div className="space-y-6">
        <NeedsAction />
        <PipelineAndRecent />
        <RecentJobs />
        <RecentActivity />
      </div>
    </>
  );
}
