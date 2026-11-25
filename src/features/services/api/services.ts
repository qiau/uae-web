import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";
import { MAX_PAGE_LIMIT, type Page, type Service } from "@/types/api";

export type PageParams = {
  limit?: number;
  offset?: number;
};

export const serviceKeys = {
  all: ["services"] as const,
  list: (params: PageParams) => ["services", params] as const,
};

/** The catalog is small; load one page at the maximum size the backend allows. */
export function useServices() {
  const params = { limit: MAX_PAGE_LIMIT, offset: 0 };
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: ({ signal }) => apiRequest<Page<Service>>("/services", { query: params, signal }),
  });
}
