/**
 * Types mirrored from uae-backend (MVP 1). Source files are noted per type.
 * Do not add fields here that the backend does not return.
 */

/** app/schemas/common.py: Page[T] */
export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

/** app/schemas/common.py: DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT */
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/** docs/api-contracts.md: error codes */
export type ApiErrorCode =
  | "authentication_failed"
  | "permission_denied"
  | "not_found"
  | "method_not_allowed"
  | "validation_error"
  | "internal_error"
  | "service_unavailable"
  | "configuration_error"
  | "bad_request"
  | "http_error";

/** app/core/errors.py: _validation_error_handler details */
export type ValidationIssue = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

/** app/schemas/common.py: ErrorResponse */
export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    details: ValidationIssue[] | null | unknown;
  };
};

/** Auth contract agreed with the backend: access token only; refresh token is an HttpOnly cookie. */
export type SessionResponse = {
  access_token: string;
  expires_in: number;
  username?: string;
};

/** app/auth/ldap_client.py: USERNAME_PATTERN */
export const USERNAME_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

/** app/models/role.py */
export const ROLES = ["requester", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** app/schemas/service.py: ServiceRead */
export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
};

/** app/schemas/service.py: ServiceSummary */
export type ServiceSummary = {
  id: string;
  name: string;
  category: string;
};

/** app/models/service_request.py: REQUEST_STATUSES */
export const REQUEST_STATUSES = [
  "submitted",
  "approved",
  "rejected",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** app/schemas/request.py: RequestRead. status is a plain string in the schema. */
export type ServiceRequest = {
  id: string;
  status: RequestStatus | (string & Record<never, never>);
  request_data: Record<string, unknown>;
  service: ServiceSummary;
  created_at: string;
  updated_at: string;
};

/** app/schemas/request.py: RequestCreate */
export type RequestCreate = {
  service_id: string;
  request_data: Record<string, unknown>;
};

/** app/schemas/request.py: REQUEST_DATA_MAX_BYTES */
export const REQUEST_DATA_MAX_BYTES = 64 * 1024;

/** app/models/request_approval.py: APPROVAL_STATUSES (schema only, no endpoints) */
export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** app/models/automation_job.py: JOB_STATUSES (schema only, no endpoints) */
export const JOB_STATUSES = ["pending", "running", "succeeded", "failed", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
