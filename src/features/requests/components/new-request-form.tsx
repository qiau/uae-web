import { CircleAlert, Info, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { PageHeader, Panel } from "@/components/common/page-header";
import { EmptyState, QueryError } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useNewRequestForm } from "../hooks/use-new-request-form";
import { SUMMARY_MAX } from "../lib/request-form";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

export function NewRequestForm() {
  const {
    services,
    items,
    selected,
    preselectedMissing,
    serviceId,
    summary,
    details,
    specs,
    errors,
    ids,
    pending,
    onSubmit,
    chooseService,
    changeSummary,
    setDetails,
    updateSpec,
    addSpec,
    removeSpec,
  } = useNewRequestForm();

  if (services.isError) {
    return (
      <>
        <PageHeader title="New request" />
        <Panel>
          <QueryError error={services.error} what="the service catalog" onRetry={() => void services.refetch()} />
        </Panel>
      </>
    );
  }

  if (services.isSuccess && items.length === 0) {
    return (
      <>
        <PageHeader title="New request" />
        <Panel>
          <EmptyState title="There are no services to request yet">
            IT administrators add services to the catalog. Contact the IT service desk if you need something now.
          </EmptyState>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="New request"
        description="Tell IT what you need. You can follow its progress under My requests."
      />

      <form noValidate onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Panel bodyClassName="space-y-6 p-4 sm:p-5">
          {errors.form && (
            <p
              role="alert"
              className="flex gap-2 rounded-md border border-destructive/40 bg-status-failed-bg px-3 py-2 text-sm text-status-failed"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errors.form}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor={ids.service}>Service</Label>
            {services.isPending ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                id={ids.service}
                value={selected ? serviceId : ""}
                onChange={(event) => chooseService(event.target.value)}
                aria-invalid={Boolean(errors.service)}
                aria-describedby={errors.service ? ids.serviceError : undefined}
                className={selectClass}
              >
                <option value="" disabled>
                  Choose a service
                </option>
                {items.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.category})
                  </option>
                ))}
              </select>
            )}
            {(errors.service || preselectedMissing) && (
              <p id={ids.serviceError} className="text-sm text-destructive">
                {errors.service ?? "The service in the link is not available. Choose a service from the list."}
              </p>
            )}
            {selected?.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.summary}>Summary</Label>
            <Input
              id={ids.summary}
              value={summary}
              maxLength={SUMMARY_MAX + 50}
              onChange={(event) => changeSummary(event.target.value)}
              aria-invalid={Boolean(errors.summary)}
              aria-describedby={errors.summary ? `${ids.summaryHint} ${ids.summaryError}` : ids.summaryHint}
              className="h-9"
            />
            <p id={ids.summaryHint} className="text-sm text-muted-foreground">
              One line, for example: 4 vCPU Ubuntu server for the reporting team.
            </p>
            {errors.summary && (
              <p id={ids.summaryError} className="text-sm text-destructive">
                {errors.summary}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.details}>
              Details <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={ids.details}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={5}
              aria-describedby={ids.detailsHint}
            />
            <p id={ids.detailsHint} className="text-sm text-muted-foreground">
              Why you need it, by when, and anything the approver should know.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Specifications <span className="font-normal text-muted-foreground">(optional)</span>
            </legend>
            <p className="text-sm text-muted-foreground">
              Add named values such as environment, size, or IP address.
            </p>
            {specs.length > 0 && (
              <ul className="space-y-2">
                {specs.map((spec, index) => (
                  <li key={spec.id} className="space-y-1">
                    <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                      <Input
                        value={spec.key}
                        onChange={(event) => updateSpec(spec.id, { key: event.target.value })}
                        placeholder="Name"
                        aria-label={`Specification ${index + 1} name`}
                        aria-invalid={Boolean(errors.specs?.[spec.id])}
                        className="h-9 font-mono sm:w-48"
                      />
                      <Input
                        value={spec.value}
                        onChange={(event) => updateSpec(spec.id, { value: event.target.value })}
                        placeholder="Value"
                        aria-label={`Specification ${index + 1} value`}
                        className="h-9 flex-1 font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => removeSpec(spec.id)}
                        aria-label={`Remove specification ${index + 1}`}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                    {errors.specs?.[spec.id] && <p className="text-sm text-destructive">{errors.specs[spec.id]}</p>}
                  </li>
                ))}
              </ul>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              <Plus aria-hidden />
              Add specification
            </Button>
          </fieldset>

          <div className="flex flex-wrap gap-2 border-t pt-5">
            <Button type="submit" size="lg" className="h-9" disabled={pending || services.isPending}>
              {pending ? "Creating request" : "Create request"}
            </Button>
            <Link to="/services" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-9")}>
              Cancel
            </Link>
          </div>
        </Panel>

        <aside className="space-y-3 text-sm">
          <div className="flex gap-2 rounded-xl border bg-card p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">What happens next</p>
              <p>Your request is saved with the status Submitted.</p>
              <p>
                Approval and automation are not connected to Rheo yet, so the request stays Submitted until they are.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
