/**
 * SAMPLE DATA ONLY. The audit log has no read endpoint yet.
 */
export type SampleActivity = {
  id: string;
  /** Mirrors audit_logs.action naming, for example "request.created". */
  action: string;
  description: string;
  actor: string;
  created_at: string;
};

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

export const sampleActivity: SampleActivity[] = [
  {
    id: "act-1",
    action: "job.started",
    description: "Provisioning started for virtual machine request 5c1e9a70",
    actor: "Automation",
    created_at: minutesAgo(6),
  },
  {
    id: "act-2",
    action: "request.created",
    description: "IP address reservation requested",
    actor: "aputri",
    created_at: minutesAgo(18),
  },
  {
    id: "act-3",
    action: "approval.approved",
    description: "DNS record reports.internal approved",
    actor: "hwijaya",
    created_at: minutesAgo(97),
  },
  {
    id: "act-4",
    action: "job.failed",
    description: "Firewall rule for db-reporting-01 failed to apply",
    actor: "Automation",
    created_at: minutesAgo(248),
  },
];
