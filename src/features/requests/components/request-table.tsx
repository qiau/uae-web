import { Link } from "react-router";

import { StatusBadge } from "@/components/common/status-badge";
import { requestStatusInfo } from "@/components/common/status-info";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatRelative, shortId } from "@/lib/format";
import type { ServiceRequest } from "@/types/api";

export function RequestTable({ requests, caption }: { requests: ServiceRequest[]; caption: string }) {
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4 sm:pl-5">Request</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="pr-4 sm:pr-5">Last updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="pl-4 sm:pl-5">
              <Link
                to={`/requests/${request.id}`}
                className="font-mono text-sm text-primary underline-offset-4 hover:underline"
                aria-label={`Request ${shortId(request.id)}, ${request.service.name}`}
              >
                {shortId(request.id)}
              </Link>
            </TableCell>
            <TableCell>
              <span className="font-medium">{request.service.name}</span>
              <span className="ml-2 text-muted-foreground">{request.service.category}</span>
            </TableCell>
            <TableCell>
              <StatusBadge info={requestStatusInfo(request.status)} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              <time dateTime={request.created_at} title={formatDateTime(request.created_at)}>
                {formatRelative(request.created_at)}
              </time>
            </TableCell>
            <TableCell className="pr-4 text-muted-foreground sm:pr-5">
              <time dateTime={request.updated_at} title={formatDateTime(request.updated_at)}>
                {formatRelative(request.updated_at)}
              </time>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
