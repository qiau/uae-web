import { isRouteErrorResponse, useRouteError } from "react-router";

import { Button } from "@/components/ui/button";

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      {notFound ? (
        <h1 className="text-xl font-semibold tracking-tight">This page could not be found.</h1>
      ) : (
        <>
          <h1 className="text-xl font-semibold tracking-tight">This page could not be loaded.</h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </>
      )}
    </div>
  );
}
