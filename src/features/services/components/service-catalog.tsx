import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { PageHeader, Panel } from "@/components/common/page-header";
import { EmptyState, QueryError, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useServices } from "../api/services";

export function ServiceCatalog() {
  const query = useServices();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const services = useMemo(() => query.data?.items ?? [], [query.data]);
  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category))].sort((a, b) => a.localeCompare(b)),
    [services],
  );
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return services.filter(
      (service) =>
        (!category || service.category === category) &&
        (!needle ||
          service.name.toLowerCase().includes(needle) ||
          (service.description ?? "").toLowerCase().includes(needle)),
    );
  }, [services, search, category]);

  const filtered = Boolean(search.trim() || category);

  return (
    <>
      <PageHeader title="Service catalog" description="Find the IT service you need and start a request for it." />

      <Panel
        title={
          query.data ? (
            <>
              Available services
              <span className="tabular text-sm font-normal text-muted-foreground">{query.data.total}</span>
            </>
          ) : (
            "Available services"
          )
        }
        actions={
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services"
              aria-label="Search services"
              className="pl-8"
            />
          </div>
        }
      >
        {categories.length > 1 && (
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5 border-b px-4 py-2.5 sm:px-5">
            <Button
              variant={category === null ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              All categories
            </Button>
            {categories.map((name) => (
              <Button
                key={name}
                variant={category === name ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={category === name}
                onClick={() => setCategory(category === name ? null : name)}
              >
                {name}
              </Button>
            ))}
          </div>
        )}

        {query.isPending ? (
          <TableSkeleton label="Loading services" />
        ) : query.isError ? (
          <QueryError error={query.error} what="the service catalog" onRetry={() => void query.refetch()} />
        ) : services.length === 0 ? (
          <EmptyState title="No services are available yet">
            IT administrators add services to the catalog. Contact the IT service desk if you need something now.
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No services match your search"
            action={
              filtered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategory(null);
                  }}
                >
                  Clear search and filters
                </Button>
              )
            }
          >
            Try a different word, or clear the filters to see every service.
          </EmptyState>
        ) : (
          <Table>
            <caption className="sr-only">IT services you can request</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 sm:pl-5">Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="pr-4 text-right sm:pr-5">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="pl-4 font-medium sm:pl-5">{service.name}</TableCell>
                  <TableCell className="text-muted-foreground">{service.category}</TableCell>
                  <TableCell className="max-w-md min-w-64 whitespace-normal text-muted-foreground">
                    {service.description ?? "No description provided."}
                  </TableCell>
                  <TableCell className="pr-4 text-right sm:pr-5">
                    <Link
                      to={`/requests/new?service=${service.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                      aria-label={`Request ${service.name}`}
                    >
                      Request service
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {query.data && query.data.total > query.data.items.length && (
          <p className="border-t px-4 py-3 text-sm text-muted-foreground sm:px-5">
            Showing the first {query.data.items.length} of {query.data.total} services. Search and category filters apply
            to these only.
          </p>
        )}
      </Panel>
    </>
  );
}
