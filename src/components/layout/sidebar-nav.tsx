import { Link, useLocation } from "react-router";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { ASSUMED_ROLES, NAV_ITEMS, isActive } from "./nav";

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const items = NAV_ITEMS.filter((item) => item.roles.some((role) => ASSUMED_ROLES.includes(role)));

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        const link = (
          <Link
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-primary")} aria-hidden />
            {collapsed ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.sample && <span className="text-xs text-muted-foreground">Sample</span>}
              </>
            )}
          </Link>
        );

        if (!collapsed) return <div key={item.href}>{link}</div>;
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger render={link} />
            <TooltipContent side="right">
              {item.label}
              {item.sample ? " (sample data)" : ""}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
