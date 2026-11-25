import { shortId } from "@/lib/format";

import type { SampleJob } from "../mock";

export type JobAction = "run" | "cancel";

export const JOB_ACTION_COPY: Record<JobAction, { label: string; effect: (job: SampleJob) => string; done: string }> = {
  run: {
    label: "Run job again",
    effect: (job) =>
      `This sends ${job.automation_type} to the automation system again for request ${shortId(job.request_id)}. It may change live infrastructure.`,
    done: "Job run again",
  },
  cancel: {
    label: "Cancel job",
    effect: (job) =>
      `This stops ${job.automation_type} for request ${shortId(job.request_id)}. Steps that already finished are not rolled back.`,
    done: "Job cancelled",
  },
};
