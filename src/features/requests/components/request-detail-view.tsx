import { ArrowLeft, CircleCheck, MessageSquare } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { PageHeader, Panel } from "@/components/common/page-header";
import { EmptyState, QueryError } from "@/components/common/states";
import { StatusBadge } from "@/components/common/status-badge";
import { requestStatusInfo } from "@/components/common/status-info";
import { buttonVariants } from "@/components/ui/button-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-errors";
import { shortId } from "@/lib/format";

import { useRequest } from "../api/requests";
import { RequestData } from "./request-data";
import { RequestFacts } from "./request-facts";
import { RequestTimeline } from "./request-timeline";

const backLink = (
  <Link to="/requests" className={buttonVariants({ variant: "ghost", size: "sm" })}>
    <ArrowLeft aria-hidden />
    My requests
  </Link>
);

export function RequestDetailView({ requestId }: { requestId: string }) {
  const [searchParams] = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const query = useRequest(requestId);

  if (query.isPending) {
    return (
      <div role="status" aria-label="Loading request" className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    const missing =
      query.error instanceof ApiError && (query.error.code === "not_found" || query.error.code === "validation_error");
    return (
      <>
        <div className="mb-4">{backLink}</div>
        <Panel>
          {missing ? (
            <EmptyState
              title="Request not found"
              action={
                <Link to="/requests" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Go to My requests
                </Link>
              }
            >
              This request does not exist, or it belongs to someone else. You can only open your own requests.
            </EmptyState>
          ) : (
            <QueryError error={query.error} what="this request" onRetry={() => void query.refetch()} />
          )}
        </Panel>
      </>
    );
  }

  const request = query.data;
  const summary = typeof request.request_data.summary === "string" ? request.request_data.summary : null;

  return (
    <>
      <div className="mb-4">{backLink}</div>
      <PageHeader
        title={
          <>
            {request.service.name}{" "}
            <span className="font-mono text-base font-normal text-muted-foreground">{shortId(request.id)}</span>
          </>
        }
        meta={<StatusBadge info={requestStatusInfo(request.status)} />}
        description={summary ?? undefined}
      />

      {justCreated && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-md border bg-status-succeeded-bg px-3 py-2 text-sm text-status-succeeded"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          Request created. It is saved with the status Submitted.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="Progress" bodyClassName="px-4 py-5 sm:px-5">
            <RequestTimeline request={request} />
          </Panel>
          <Panel title="What was requested">
            <RequestData data={request.request_data} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Request details">
            <RequestFacts request={request} />
          </Panel>
          <Panel title="History and comments" bodyClassName="flex gap-2 px-4 py-4 text-sm text-muted-foreground sm:px-5">
            <MessageSquare className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Request history and comments are not available in Rheo yet. The progress above shows the current status.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
