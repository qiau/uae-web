export function DataValue({ value }: { value: unknown }) {
  if (typeof value === "string") return <span className="break-words whitespace-pre-wrap">{value}</span>;
  if (typeof value === "number" || typeof value === "boolean") return <span className="font-mono">{String(value)}</span>;
  if (value === null) return <span className="text-muted-foreground">Empty</span>;
  return (
    <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Shows request_data. Fields written by the Rheo new-request form get friendly labels. */
export function RequestData({ data }: { data: Record<string, unknown> }) {
  const { summary, details, specifications, ...rest } = data;
  const specs = isPlainObject(specifications) ? specifications : null;
  const other = specs ? rest : { ...rest, ...(specifications !== undefined ? { specifications } : {}) };
  const entries = Object.entries(other);

  if (summary === undefined && details === undefined && !specs && entries.length === 0) {
    return <p className="px-4 py-4 text-sm text-muted-foreground sm:px-5">This request has no details.</p>;
  }

  return (
    <dl className="divide-y text-sm">
      {summary !== undefined && (
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:px-5">
          <dt className="text-muted-foreground">Summary</dt>
          <dd className="font-medium">
            <DataValue value={summary} />
          </dd>
        </div>
      )}
      {details !== undefined && (
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:px-5">
          <dt className="text-muted-foreground">Details</dt>
          <dd className="max-w-prose">
            <DataValue value={details} />
          </dd>
        </div>
      )}
      {[...Object.entries(specs ?? {}), ...entries].map(([key, value]) => (
        <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:px-5">
          <dt className="truncate font-mono text-muted-foreground" title={key}>
            {key}
          </dt>
          <dd className="min-w-0">
            <DataValue value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
