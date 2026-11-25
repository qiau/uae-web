import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

function shouldRetry(failureCount: number, error: unknown) {
  // Client errors (401, 403, 404, 422) will not change on retry.
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
