import { Info } from "lucide-react";

import { PageHeader, Panel } from "@/components/common/page-header";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { EmptyState } from "@/components/common/states";
import { StatusBadge } from "@/components/common/status-badge";
import { approvalStatusInfo } from "@/components/common/status-info";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useApprovals } from "../hooks/use-approvals";
import { DecisionPanel } from "./decision-panel";

export function ApprovalsView() {
  const { filter, setFilter, selectedId, setSelectedId, notice, visible, selected, pendingCount, decideSelected } =
    useApprovals();

  return (
    <>
      <PageHeader
        title="Approvals"
        meta={
          <SampleDataBadge reason="Approvals are not connected to Rheo yet. These requests are examples, and decisions are not saved." />
        }
        description="Requests waiting for your decision. Check what is requested and its effect before you decide."
      />

      {notice && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel
          title="Queue"
          actions={
            <div role="group" aria-label="Show" className="flex gap-1">
              {(["pending", "decided"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "secondary" : "ghost"}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === "pending" ? `Waiting (${pendingCount})` : "Decided"}
                </Button>
              ))}
            </div>
          }
        >
          {visible.length === 0 ? (
            <EmptyState title={filter === "pending" ? "Nothing is waiting for you" : "No decisions yet"}>
              {filter === "pending"
                ? "New approval requests will appear here."
                : "Requests you approve or reject will be listed here."}
            </EmptyState>
          ) : (
            <Table>
              <caption className="sr-only">Approval requests (sample data)</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 sm:pl-5">Request</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Waiting since</TableHead>
                  <TableHead className="pr-4 sm:pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((approval) => (
                  <TableRow key={approval.id} data-state={approval.id === selectedId ? "selected" : undefined}>
                    <TableCell className="pl-4 sm:pl-5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(approval.id)}
                        aria-pressed={approval.id === selectedId}
                        className={cn(
                          "rounded-sm text-left font-medium underline-offset-4 hover:underline",
                          approval.id === selectedId && "text-primary",
                        )}
                      >
                        {approval.service_name}
                      </button>
                      <p className="max-w-xs truncate text-muted-foreground">{approval.summary}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{approval.requester}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={approval.created_at} title={formatDateTime(approval.created_at)}>
                        {formatRelative(approval.created_at)}
                      </time>
                    </TableCell>
                    <TableCell className="pr-4 sm:pr-5">
                      <StatusBadge info={approvalStatusInfo(approval.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <div>
          {selected ? (
            <DecisionPanel
              key={selected.id}
              approval={selected}
              onDecide={(decision) => decideSelected(decision)}
            />
          ) : (
            <Panel>
              <EmptyState title="Select a request to review">
                Choose a request from the queue to see what it does and decide.
              </EmptyState>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
