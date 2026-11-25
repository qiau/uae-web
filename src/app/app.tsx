import { RouterProvider } from "react-router";

import { AuthProvider } from "@/features/auth";

import { Providers } from "./providers";
import { router } from "./router";

export function App() {
  return (
    <Providers>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Providers>
  );
}
