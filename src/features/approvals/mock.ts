import type { ApprovalStatus } from "@/types/api";

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

/**
 * SAMPLE DATA ONLY. Nothing here comes from uae-backend.
 *
 * The backend has a request_approvals table but no approval endpoints or
 * approver role yet. Replace with a real endpoint when one exists.
 */
export type SampleApproval = {
  id: string;
  /** request_approvals.request_id */
  request_id: string;
  status: ApprovalStatus;
  created_at: string;
  /** mock-only: the backend would join these from service_requests and users. */
  service_name: string;
  requester: string;
  summary: string;
  consequence: string;
  request_data: Record<string, unknown>;
};

export const sampleApprovals: SampleApproval[] = [
  {
    id: "a1f0c2d4-0000-4000-8000-000000000001",
    request_id: "5c1e9a70-3f2b-4d8e-9a61-0b7d2e4f8a11",
    status: "pending",
    created_at: minutesAgo(42),
    service_name: "Virtual machine",
    requester: "dsetiawan",
    summary: "4 vCPU, 16 GB RAM, Ubuntu 24.04 for the payments staging cluster",
    consequence: "Approving starts provisioning in the staging VMware cluster and reserves one IP address.",
    request_data: { environment: "staging", cpu: 4, memory_gb: 16, os: "ubuntu-24.04" },
  },
  {
    id: "a1f0c2d4-0000-4000-8000-000000000002",
    request_id: "8b2d4f61-7a3c-4e19-b5d2-6c8e1f0a9b22",
    status: "pending",
    created_at: minutesAgo(135),
    service_name: "Firewall rule",
    requester: "rkurniawan",
    summary: "Allow TCP 5432 from 10.20.4.0/24 to db-reporting-01",
    consequence: "Approving opens port 5432 on the reporting database to one internal subnet.",
    request_data: { source: "10.20.4.0/24", destination: "db-reporting-01", port: 5432 },
  },
  {
    id: "a1f0c2d4-0000-4000-8000-000000000003",
    request_id: "1e7a3c95-2d4b-4f60-8c17-9a3b5d7e1f33",
    status: "pending",
    created_at: minutesAgo(380),
    service_name: "DNS record",
    requester: "aputri",
    summary: "A record reports.internal pointing to 10.20.8.15",
    consequence: "Approving publishes the record to internal DNS within about five minutes.",
    request_data: { type: "A", name: "reports.internal", value: "10.20.8.15" },
  },
];
