import { CopyButton } from "@/components/common/copy-button";
import { formatDateTime } from "@/lib/format";
import type { ServiceRequest } from "@/types/api";

export function RequestFacts({ request }: { request: ServiceRequest }) {
  return (
    <dl className="divide-y text-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <dt className="text-muted-foreground">Request ID</dt>
        <dd className="flex min-w-0 items-center gap-1">
          <span className="truncate font-mono text-xs" title={request.id}>
            {request.id}
          </span>
          <CopyButton value={request.id} label="Copy request ID" />
        </dd>
      </div>
      <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
        <dt className="text-muted-foreground">Service</dt>
        <dd className="text-right">{request.service.name}</dd>
      </div>
      <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
        <dt className="text-muted-foreground">Category</dt>
        <dd>{request.service.category}</dd>
      </div>
      <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
        <dt className="text-muted-foreground">Created</dt>
        <dd>
          <time dateTime={request.created_at}>{formatDateTime(request.created_at)}</time>
        </dd>
      </div>
      <div className="flex justify-between gap-2 px-4 py-2.5 sm:px-5">
        <dt className="text-muted-foreground">Last updated</dt>
        <dd>
          <time dateTime={request.updated_at}>{formatDateTime(request.updated_at)}</time>
        </dd>
      </div>
    </dl>
  );
}
