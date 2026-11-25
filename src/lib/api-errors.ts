import type { ApiErrorBody, ApiErrorCode, ValidationIssue } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | "network_error";
  readonly details: unknown;

  constructor(status: number, code: ApiErrorCode | "network_error", message: string, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get validationIssues(): ValidationIssue[] {
    return Array.isArray(this.details) ? (this.details as ValidationIssue[]) : [];
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const error = (value as { error: unknown }).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { code?: unknown }).code === "string" &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

/** Builds an ApiError from any failed response, using the backend error shape when present. */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body, for example a proxy error page.
  }
  if (isErrorBody(body)) {
    return new ApiError(response.status, body.error.code, body.error.message, body.error.details);
  }
  if (response.status >= 500) {
    return new ApiError(
      response.status,
      "service_unavailable",
      "The Rheo service did not respond. Try again in a moment.",
    );
  }
  return new ApiError(response.status, "http_error", `Request failed with status ${response.status}.`);
}

export function networkError(): ApiError {
  return new ApiError(0, "network_error", "Rheo could not reach the server. Check your connection and try again.");
}

/** A user-facing explanation for an error, with a next step. */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something unexpected stopped this page from loading. Reload the page to try again.";
  }
  switch (error.code) {
    case "permission_denied":
      return "Your account does not have access to this. Ask an IT administrator to grant the right role.";
    case "service_unavailable":
      return "A system Rheo depends on is unavailable right now. Try again in a few minutes.";
    case "configuration_error":
      return "Rheo is not fully set up yet. Contact an IT administrator.";
    case "internal_error":
      return "The server hit an error while handling this. Try again, and contact IT if it keeps happening.";
    default:
      return error.message;
  }
}
