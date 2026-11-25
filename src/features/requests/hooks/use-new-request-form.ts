import { useId, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { useServices } from "@/features/services";
import { ApiError, describeError } from "@/lib/api-errors";
import { REQUEST_DATA_MAX_BYTES } from "@/types/api";

import { useCreateRequest } from "../api/requests";
import { SUMMARY_MAX, buildRequestData, byteSize, type RequestFormErrors, type Spec } from "../lib/request-form";

export function useNewRequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const services = useServices();
  const createRequest = useCreateRequest();

  const [serviceId, setServiceId] = useState(searchParams.get("service") ?? "");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [nextSpecId, setNextSpecId] = useState(1);
  const [errors, setErrors] = useState<RequestFormErrors>({});

  const ids = {
    service: useId(),
    serviceError: useId(),
    summary: useId(),
    summaryError: useId(),
    summaryHint: useId(),
    details: useId(),
    detailsHint: useId(),
  };

  const items = services.data?.items ?? [];
  const selected = items.find((service) => service.id === serviceId);
  const preselectedMissing = Boolean(serviceId) && services.isSuccess && !selected;

  function validate(): RequestFormErrors {
    const next: RequestFormErrors = {};
    if (!selected) next.service = "Choose the service you are requesting.";
    if (!summary.trim()) next.summary = "Describe what you need in one line.";
    else if (summary.trim().length > SUMMARY_MAX) next.summary = `Keep the summary under ${SUMMARY_MAX} characters.`;

    const specErrors: Record<number, string> = {};
    const seen = new Set<string>();
    for (const spec of specs) {
      const key = spec.key.trim();
      if (!key && spec.value.trim()) specErrors[spec.id] = "Add a name for this value, or remove the row.";
      else if (key && seen.has(key.toLowerCase())) specErrors[spec.id] = `"${key}" is used twice. Use each name once.`;
      if (key) seen.add(key.toLowerCase());
    }
    if (Object.keys(specErrors).length) next.specs = specErrors;
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.service) return document.getElementById(ids.service)?.focus();
    if (found.summary) return document.getElementById(ids.summary)?.focus();
    if (found.specs) return;

    const requestData = buildRequestData(summary, details, specs);
    if (byteSize(requestData) > REQUEST_DATA_MAX_BYTES) {
      setErrors({ form: "This request is larger than 64 KB. Shorten the details or remove some specifications." });
      return;
    }

    try {
      const created = await createRequest.mutateAsync({ service_id: serviceId, request_data: requestData });
      navigate(`/requests/${created.id}?created=1`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "not_found") {
        setErrors({ service: "This service is no longer available. Choose another service." });
        void services.refetch();
      } else if (error instanceof ApiError && error.code === "validation_error") {
        const issues = error.validationIssues.map((issue) => issue.msg).join(" ");
        setErrors({ form: `The request was not accepted: ${issues || error.message}` });
      } else {
        setErrors({ form: describeError(error) });
      }
    }
  }

  function chooseService(value: string) {
    setServiceId(value);
    setErrors((current) => ({ ...current, service: undefined }));
  }

  function changeSummary(value: string) {
    setSummary(value);
    if (errors.summary) setErrors((current) => ({ ...current, summary: undefined }));
  }

  function updateSpec(id: number, patch: Partial<Spec>) {
    setSpecs((current) => current.map((spec) => (spec.id === id ? { ...spec, ...patch } : spec)));
  }

  function addSpec() {
    setSpecs((current) => [...current, { id: nextSpecId, key: "", value: "" }]);
    setNextSpecId((id) => id + 1);
  }

  function removeSpec(id: number) {
    setSpecs((current) => current.filter((spec) => spec.id !== id));
  }

  return {
    services,
    createRequest,
    items,
    selected,
    preselectedMissing,
    serviceId,
    summary,
    details,
    specs,
    errors,
    ids,
    pending: createRequest.isPending,
    onSubmit,
    chooseService,
    changeSummary,
    setDetails,
    updateSpec,
    addSpec,
    removeSpec,
  };
}
