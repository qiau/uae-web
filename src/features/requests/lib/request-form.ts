export const SUMMARY_MAX = 200;

export type Spec = {
  id: number;
  key: string;
  value: string;
};

export type RequestFormErrors = {
  service?: string;
  summary?: string;
  specs?: Record<number, string>;
  form?: string;
};

/**
 * The backend accepts any JSON object as request_data and has no per-service
 * form schema yet, so this form collects a summary, details, and optional
 * key/value specifications.
 */
export function buildRequestData(summary: string, details: string, specs: Spec[]) {
  const data: Record<string, unknown> = { summary: summary.trim() };
  if (details.trim()) data.details = details.trim();
  const filled = specs.filter((spec) => spec.key.trim());
  if (filled.length) {
    data.specifications = Object.fromEntries(filled.map((spec) => [spec.key.trim(), spec.value.trim()]));
  }
  return data;
}

export function byteSize(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}
