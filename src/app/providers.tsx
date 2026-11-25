import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
