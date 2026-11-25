import { Panel } from "@/components/common/page-header";
import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { formatDateTime, formatRelative } from "@/lib/format";

import { sampleActivity } from "../mock";

export function RecentActivity() {
  return (
    <Panel
      title={
        <>
          Recent activity{" "}
          <SampleDataBadge reason="Activity history is not connected yet. These entries are examples, not real records." />
        </>
      }
    >
      <ol className="divide-y">
        {sampleActivity.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-5">
            <time
              dateTime={entry.created_at}
              title={formatDateTime(entry.created_at)}
              className="w-28 shrink-0 text-muted-foreground"
            >
              {formatRelative(entry.created_at)}
            </time>
            <span className="min-w-0 flex-1">{entry.description}</span>
            <span className="font-mono text-xs text-muted-foreground">{entry.actor}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
