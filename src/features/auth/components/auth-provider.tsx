import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { RheoMark } from "@/components/common/rheo-logo";
import { useSession } from "@/hooks/use-session";
import { refreshSession } from "@/lib/auth-session";

/**
 * Restores the session from the refresh cookie before the app renders.
 * Any failure flips the session store to signed_out/expired, which SessionGate
 * turns into a redirect with the matching reason.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (session.status !== "unknown") return;
    refreshSession().catch(() => {
      // The store already records signed_out/expired; SessionGate handles the redirect.
    });
  }, [session.status]);

  useEffect(() => {
    if (session.status === "signed_out" || session.status === "expired") queryClient.clear();
  }, [session.status, queryClient]);

  if (session.status === "unknown") {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
        <RheoMark className="text-primary" />
        Opening Rheo
      </div>
    );
  }

  return children;
}
