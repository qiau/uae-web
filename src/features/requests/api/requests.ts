import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";
import type { Page, RequestCreate, ServiceRequest } from "@/types/api";

import type { PageParams } from "@/features/services/api/services";

export const requestKeys = {
  all: ["requests"] as const,
  list: (params: PageParams) => ["requests", params] as const,
  detail: (id: string) => ["request", id] as const,
};

/** GET /api/v1/requests: the caller's own requests, newest first. */
export function useRequests(params: PageParams) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: ({ signal }) => apiRequest<Page<ServiceRequest>>("/requests", { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

/** GET /api/v1/requests/{request_id}: 404 for a missing request or another user's request. */
export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: ({ signal }) => apiRequest<ServiceRequest>(`/requests/${encodeURIComponent(id)}`, { signal }),
  });
}

/** POST /api/v1/requests: always created as "submitted"; nothing is triggered in MVP 1. */
export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RequestCreate) => apiRequest<ServiceRequest>("/requests", { method: "POST", body }),
    onSuccess: (created) => {
      queryClient.setQueryData(requestKeys.detail(created.id), created);
      void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}
