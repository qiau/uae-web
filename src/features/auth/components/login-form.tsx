import { CircleAlert, Eye, EyeOff, Info } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { RheoWordmark } from "@/components/common/rheo-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, describeError } from "@/lib/api-errors";
import { signIn } from "@/lib/auth-session";
import { USERNAME_PATTERN } from "@/types/api";

import { FlowField, type FlowFieldHandle } from "./flow-field";

type FieldErrors = { username?: string; password?: string };

const REASONS: Record<string, string> = {
  expired: "Your session ended. Sign in again to continue where you left off.",
  signed_out: "You have signed out of Rheo.",
  unavailable: "Rheo could not restore your session because the server did not respond. Sign in again.",
};

function validateUsername(value: string) {
  if (!value) return "Enter your network username.";
  if (!USERNAME_PATTERN.test(value)) {
    return "Usernames use letters, numbers, dots, hyphens, and underscores only, up to 64 characters. Do not include a domain.";
  }
  return undefined;
}

function validatePassword(value: string) {
  return value ? undefined : "Enter your password.";
}

/** Only allow same-site relative paths as a redirect target. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function signInErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "authentication_failed") {
      return "The username or password is incorrect. Use the same account you use to sign in to your work computer.";
    }
    if (error.code === "service_unavailable") {
      return "Sign-in is unavailable because the company directory or database cannot be reached. Try again in a few minutes.";
    }
    if (error.code === "configuration_error") {
      return "Rheo is not fully set up yet, so new accounts cannot sign in. Contact an IT administrator.";
    }
  }
  return describeError(error);
}

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = REASONS[searchParams.get("reason") ?? ""];
  const next = safeNext(searchParams.get("next"));

  const panelRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<FlowFieldHandle>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const usernameErrorId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim();
    const errors: FieldErrors = {
      username: validateUsername(trimmed),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setFormError(null);
    if (errors.username) return usernameRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    setPending(true);
    try {
      await signIn(trimmed, password);
    } catch (error) {
      setPending(false);
      setFormError(signInErrorMessage(error));
      if (error instanceof ApiError && error.code === "authentication_failed") {
        setPassword("");
        passwordRef.current?.focus();
      }
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      navigate(next, { replace: true });
    } else {
      flowRef.current?.accelerate();
      window.setTimeout(() => navigate(next, { replace: true }), 650);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <FlowField ref={flowRef} obstacleRef={panelRef} />

      <div ref={panelRef} className="relative w-full max-w-sm rounded-xl border bg-card p-6 text-card-foreground sm:p-8">
        <RheoWordmark className="mb-6" />
        <h1 className="text-xl font-semibold tracking-tight">Sign in to Rheo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your company network account.</p>

        {reason && !formError && (
          <p role="status" className="mt-5 flex gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            {reason}
          </p>
        )}

        {formError && (
          <p
            id={formErrorId}
            role="alert"
            className="mt-5 flex gap-2 rounded-md border border-destructive/40 bg-status-failed-bg px-3 py-2 text-sm text-status-failed"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError}
          </p>
        )}

        <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5" aria-describedby={formError ? formErrorId : undefined}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              ref={usernameRef}
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              required
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (fieldErrors.username) setFieldErrors((current) => ({ ...current, username: undefined }));
              }}
              onBlur={() => username && setFieldErrors((current) => ({ ...current, username: validateUsername(username.trim()) }))}
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={fieldErrors.username ? usernameErrorId : undefined}
              className="h-9 font-mono"
            />
            {fieldErrors.username && (
              <p id={usernameErrorId} className="text-sm text-destructive">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? passwordErrorId : undefined}
                className="h-9 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute top-1 right-1"
              >
                {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </div>
            {fieldErrors.password && (
              <p id={passwordErrorId} className="text-sm text-destructive">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="h-9 w-full" disabled={pending}>
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          Sign-in attempts are recorded. Forgot your password? Reset it through the IT service desk.
        </p>
      </div>
    </div>
  );
}
