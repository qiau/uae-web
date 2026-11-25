import { Outlet } from "react-router";

import { AppShell } from "./app-shell";
import { SessionGate } from "./session-gate";

export function AppLayout() {
  return (
    <SessionGate>
      <AppShell>
        <Outlet />
      </AppShell>
    </SessionGate>
  );
}
