import { env } from "@/config/env";
import { networkError, toApiError } from "@/lib/api-errors";
import { getAccessToken, refreshSession } from "@/lib/auth-session";

type Query = Record<string, string | number | undefined>;

type RequestOptions = {
  method?: "GET" | "POST";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${env.apiBaseUrl}/api/v1${path}${search ? `?${search}` : ""}`;
}

async function send(url: string, token: string, options: RequestOptions): Promise<Response> {
  try {
    return await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw networkError();
  }
}

/**
 * The only place that talks to uae-backend data endpoints. Adds the bearer
 * token, retries once after a refresh on 401, and throws ApiError otherwise.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  let response = await send(url, await getAccessToken(), options);
  if (response.status === 401) {
    response = await send(url, await refreshSession(), options);
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
