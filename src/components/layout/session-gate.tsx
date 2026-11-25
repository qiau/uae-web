import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import { RheoMark } from "@/components/common/rheo-logo";
import { useSession } from "@/hooks/use-session";

/**
 * Sends the user to sign in when there is no valid session. The refresh itself
 * happens in AuthProvider; this component only handles the redirect and the
 * loading state.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session.status !== "signed_out" && session.status !== "expired") return;
    const next = `${location.pathname}${location.search}`;
    const params = new URLSearchParams();
    if (next !== "/") params.set("next", next);
    if (session.status === "expired") params.set("reason", "expired");
    else if (session.failure === "unavailable") params.set("reason", "unavailable");
    const search = params.toString();
    navigate(`/login${search ? `?${search}` : ""}`, { replace: true });
  }, [session, location.pathname, location.search, navigate]);

  if (session.status !== "authenticated") {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
        <RheoMark className="text-primary" />
        Opening Rheo
      </div>
    );
  }
  return children;
}
