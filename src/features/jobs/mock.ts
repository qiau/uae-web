import type { JobStatus } from "@/types/api";

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

/**
 * SAMPLE DATA ONLY. Nothing here comes from uae-backend.
 *
 * The backend has an automation_jobs table but no job endpoints or operator
 * role yet. Replace with real endpoints when they exist.
 */
export type SampleJob = {
  id: string;
  /** automation_jobs.request_id */
  request_id: string;
  status: JobStatus;
  automation_type: string;
  external_job_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  created_at: string;
  /** mock-only: no log storage exists in the backend. */
  log: string[];
};

export const sampleJobs: SampleJob[] = [
  {
    id: "70b1c2d3-0000-4000-8000-000000000001",
    request_id: "5c1e9a70-3f2b-4d8e-9a61-0b7d2e4f8a11",
    status: "running",
    automation_type: "vm.provision",
    external_job_id: "awx-48213",
    started_at: minutesAgo(6),
    finished_at: null,
    error_message: null,
    created_at: minutesAgo(7),
    log: [
      "Job accepted by AWX (awx-48213)",
      "Cloning template ubuntu-24.04-base",
      "Allocating 4 vCPU, 16 GB RAM",
      "Waiting for guest tools",
    ],
  },
  {
    id: "70b1c2d3-0000-4000-8000-000000000002",
    request_id: "1e7a3c95-2d4b-4f60-8c17-9a3b5d7e1f33",
    status: "succeeded",
    automation_type: "dns.record.create",
    external_job_id: "ipam-77120",
    started_at: minutesAgo(95),
    finished_at: minutesAgo(94),
    error_message: null,
    created_at: minutesAgo(96),
    log: [
      "Record reports.internal A 10.20.8.15 validated",
      "Record created in zone internal",
      "Propagation confirmed on 2 of 2 servers",
    ],
  },
  {
    id: "70b1c2d3-0000-4000-8000-000000000003",
    request_id: "8b2d4f61-7a3c-4e19-b5d2-6c8e1f0a9b22",
    status: "failed",
    automation_type: "firewall.rule.apply",
    external_job_id: "fw-30981",
    started_at: minutesAgo(250),
    finished_at: minutesAgo(248),
    error_message: "Policy package locked by another session on fw-mgmt-02.",
    created_at: minutesAgo(251),
    log: [
      "Connecting to fw-mgmt-02",
      "Validating rule against policy package dc-core",
      "Error: policy package locked by another session",
    ],
  },
  {
    id: "70b1c2d3-0000-4000-8000-000000000004",
    request_id: "3a9c7e15-6b2d-4f80-9e31-2c4a6b8d0f44",
    status: "pending",
    automation_type: "ipam.reserve",
    external_job_id: null,
    started_at: null,
    finished_at: null,
    error_message: null,
    created_at: minutesAgo(2),
    log: [],
  },
];
