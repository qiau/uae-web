/**
 * Typed access to Vite environment variables.
 *
 * Auth and data calls always use the same origin in the browser. In development
 * Vite proxies /api to the FastAPI backend; in production nginx does the same.
 */
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const env = {
  apiBaseUrl,
} as const;
