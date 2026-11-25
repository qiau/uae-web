import { RheoMark } from "@/components/common/rheo-logo";

export function RouteLoading() {
  return (
    <div role="status" className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
      <RheoMark className="text-primary" />
      Opening Rheo
    </div>
  );
}
