import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { SessionLayout } from "@/components/layout/session-layout";

import { RouteError } from "./route-error";
import { RouteLoading } from "./route-loading";

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    HydrateFallback: RouteLoading,
    children: [
      {
        path: "/login",
        lazy: page(() => import("@/pages/login/login-page")),
      },
      {
        element: <AppLayout />,
        children: [
          { index: true, lazy: page(() => import("@/pages/dashboard/dashboard-page")) },
          { path: "services", lazy: page(() => import("@/pages/services/services-page")) },
          { path: "requests", lazy: page(() => import("@/pages/requests/requests-page")) },
          { path: "requests/new", lazy: page(() => import("@/pages/requests/new-request-page")) },
          { path: "requests/:requestId", lazy: page(() => import("@/pages/requests/request-detail-page")) },
          { path: "approvals", lazy: page(() => import("@/pages/approvals/approvals-page")) },
          { path: "jobs", lazy: page(() => import("@/pages/jobs/jobs-page")) },
        ],
      },
      {
        element: <SessionLayout />,
        children: [{ path: "*", lazy: page(() => import("@/pages/not-found/not-found-page")) }],
      },
    ],
  },
]);
