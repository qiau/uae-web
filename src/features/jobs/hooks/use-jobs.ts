import { useState } from "react";
import { useSearchParams } from "react-router";

import { JOB_ACTION_COPY, type JobAction } from "../lib/job-actions";
import { sampleJobs } from "../mock";

export function useJobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState(sampleJobs);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id") ?? sampleJobs[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = jobs.find((job) => job.id === selectedId) ?? null;

  function applyAction(id: string, action: JobAction) {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id) return job;
        if (action === "cancel") {
          return { ...job, status: "cancelled", finished_at: job.started_at ? new Date().toISOString() : null };
        }
        return { ...job, status: "pending", started_at: null, finished_at: null, error_message: null, log: [] };
      }),
    );
    setNotice(`${JOB_ACTION_COPY[action].done}. Sample data: nothing was sent to an automation system.`);
  }

  return {
    jobs,
    selected,
    selectedId,
    setSelectedId,
    notice,
    applyAction,
  };
}
