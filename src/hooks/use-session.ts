import { useSyncExternalStore } from "react";

import { getSnapshot, subscribe } from "@/lib/auth-session";

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
