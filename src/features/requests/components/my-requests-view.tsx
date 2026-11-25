import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { PageHeader, Panel } from "@/components/common/page-header";
import { EmptyState, QueryError, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { DEFAULT_PAGE_LIMIT } from "@/types/api";

import { useRequests } from "../api/requests";
import { RequestTable } from "./request-table";

function readPage(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function MyRequestsView() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const page = readPage(searchParams.get("page"));
  const limit = DEFAULT_PAGE_LIMIT;
  const query = useRequests({ limit, offset: (page - 1) * limit });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  function goTo(nextPage: number) {
    navigate(nextPage === 1 ? pathname : `${pathname}?page=${nextPage}`);
  }

  return (
    <>
      <PageHeader
        title="My requests"
        description="Every request you have created, newest first."
        actions={
          <Link to="/requests/new" className={buttonVariants()}>
            <Plus aria-hidden />
            New request
          </Link>
        }
      />

      <Panel>
        {query.isPending ? (
          <TableSkeleton rows={8} label="Loading your requests" />
        ) : query.isError ? (
          <QueryError error={query.error} what="your requests" onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 && page === 1 ? (
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
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="This page is empty"
            action={
              <Button variant="outline" size="sm" onClick={() => goTo(1)}>
                Go to the first page
              </Button>
            }
          >
            You have {total} {total === 1 ? "request" : "requests"}, which fit on fewer pages.
          </EmptyState>
        ) : (
          <>
            <div aria-busy={query.isFetching} className={query.isPlaceholderData ? "opacity-60" : undefined}>
              <RequestTable requests={query.data.items} caption="Your requests" />
            </div>
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:px-5"
            >
              <p className="tabular text-muted-foreground" aria-live="polite">
                Showing {first} to {last} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
                  <ChevronLeft aria-hidden />
                  Previous page
                </Button>
                <span className="tabular text-muted-foreground">
                  Page {page} of {pageCount}
                </span>
                <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => goTo(page + 1)}>
                  Next page
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </nav>
          </>
        )}
      </Panel>
    </>
  );
}
