import { ApiError, networkError, toApiError } from "@/lib/api-errors";
import { env } from "@/config/env";
import type { SessionResponse } from "@/types/api";

/**
 * Browser session state. The access token lives only in memory; the refresh
 * token is an HttpOnly cookie set by the backend under /api/v1/auth.
 */
type SessionStatus = "unknown" | "authenticated" | "signed_out" | "expired";

export type SessionSnapshot = {
  status: SessionStatus;
  username: string;
  /** Why an automatic refresh failed, used for the sign-in page message. */
  failure: "unavailable" | null;
};

// Non-secret UI hint: the username is not authorization data, and it lets the
// shell show the account after a reload once the silent refresh succeeds.
const USERNAME_KEY = "rheo.username";

let accessToken: string | null = null;
let expiresAt = 0;
let refreshInFlight: Promise<string> | null = null;
let snapshot: SessionSnapshot = { status: "unknown", username: readUsernameHint(), failure: null };
const listeners = new Set<() => void>();

// Refresh a little before expiry so requests do not race the deadline.
const EXPIRY_MARGIN_MS = 30_000;

function readUsernameHint(): string {
  try {
    return window.localStorage.getItem(USERNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeUsernameHint(username: string) {
  try {
    if (username) window.localStorage.setItem(USERNAME_KEY, username);
    else window.localStorage.removeItem(USERNAME_KEY);
  } catch {
    // Storage unavailable; the hint just will not persist.
  }
}

function setSnapshot(next: SessionSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function applySession(session: SessionResponse, fallbackUsername = "") {
  accessToken = session.access_token;
  expiresAt = Date.now() + session.expires_in * 1000;
  const username = session.username ?? fallbackUsername ?? snapshot.username;
  if (username) writeUsernameHint(username);
  setSnapshot({ status: "authenticated", username, failure: null });
}

function clearSession(status: "signed_out" | "expired", failure: "unavailable" | null = null) {
  accessToken = null;
  expiresAt = 0;
  setSnapshot({ status, username: "", failure });
  if (status === "signed_out") writeUsernameHint("");
}

async function postAuth(path: string, body?: unknown): Promise<Response> {
  try {
    return await fetch(`${env.apiBaseUrl}/api/v1/auth/${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw networkError();
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): SessionSnapshot {
  return snapshot;
}

export async function signIn(username: string, password: string): Promise<void> {
  const response = await postAuth("login", { username, password });
  if (!response.ok) throw await toApiError(response);
  applySession((await response.json()) as SessionResponse, username.toLowerCase());
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share
 * one request so a burst of 401s produces a single rotation.
 */
export function refreshSession(): Promise<string> {
  refreshInFlight ??= (async () => {
    try {
      const response = await postAuth("refresh");
      if (!response.ok) {
        const error = await toApiError(response);
        if (response.status === 401) {
          clearSession(snapshot.status === "authenticated" ? "expired" : "signed_out");
        } else {
          clearSession("signed_out", "unavailable");
        }
        throw error;
      }
      const session = (await response.json()) as SessionResponse;
      applySession(session);
      return session.access_token;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        clearSession("signed_out", "unavailable");
      }
      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function signOut(): Promise<void> {
  try {
    await postAuth("logout");
  } finally {
    clearSession("signed_out");
  }
}

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < expiresAt - EXPIRY_MARGIN_MS) return accessToken;
  return refreshSession();
}
