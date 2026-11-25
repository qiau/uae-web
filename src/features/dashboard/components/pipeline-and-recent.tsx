import { Link } from "react-router";

import { Panel } from "@/components/common/page-header";
import { EmptyState, QueryError, TableSkeleton } from "@/components/common/states";
import { buttonVariants } from "@/components/ui/button-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestPipeline, RequestTable, useRequests } from "@/features/requests";
import { MAX_PAGE_LIMIT } from "@/types/api";

const RECENT_COUNT = 5;

export function PipelineAndRecent() {
  // No status filter or summary endpoint exists, so counts use the newest
  // MAX_PAGE_LIMIT requests (the most one page can hold).
  const query = useRequests({ limit: MAX_PAGE_LIMIT, offset: 0 });
  const data = query.data;
  const description =
    data && data.total > data.items.length
      ? `Counts cover your ${data.items.length} most recent requests out of ${data.total}.`
      : "Where each of your requests is right now.";

  return (
    <>
      <Panel
        title="Your requests by stage"
        description={description}
      >
        {query.isPending ? (
          <div
            role="status"
            aria-label="Loading request counts"
            className="grid grid-cols-2 gap-4 px-4 py-5 sm:grid-cols-4 sm:px-5"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : query.isError ? (
          <QueryError error={query.error} what="your requests" onRetry={() => void query.refetch()} />
        ) : (
          <RequestPipeline requests={query.data.items} />
        )}
      </Panel>

      <Panel
        title="Recent requests"
        actions={
          <Link to="/requests" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all requests
          </Link>
        }
      >
        {query.isPending ? (
          <TableSkeleton rows={RECENT_COUNT} label="Loading recent requests" />
        ) : query.isError ? (
          <QueryError error={query.error} what="recent requests" onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="No requests yet"
            action={
              <Link to="/services" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Browse the service catalog
              </Link>
            }
          >
            Browse the service catalog to create your first request.
          </EmptyState>
        ) : (
          <RequestTable requests={query.data.items.slice(0, RECENT_COUNT)} caption="Your most recent requests" />
        )}
      </Panel>
    </>
  );
}
