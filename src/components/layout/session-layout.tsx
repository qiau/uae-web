import { Outlet } from "react-router";

import { SessionGate } from "./session-gate";

/** Guarded layout without the app shell, used by the catch-all page. */
export function SessionLayout() {
  return (
    <SessionGate>
      <Outlet />
    </SessionGate>
  );
}
