import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";

import { RheoMark, RheoWordmark } from "@/components/common/rheo-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { CommandPalette } from "./command-palette";
import { NotificationsMenu } from "./notifications-menu";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

const COLLAPSE_KEY = "rheo.sidebar.collapsed";

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // Storage unavailable; the preference just will not persist.
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-svh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
          collapsed ? "w-14" : "w-60",
        )}
      >
        <div className={cn("flex h-14 items-center", collapsed ? "justify-center" : "px-4")}>
          <Link to="/" aria-label="Rheo dashboard" className="rounded-md">
            {collapsed ? <RheoMark className="text-primary" /> : <RheoWordmark />}
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav collapsed={collapsed} />
        </div>
        <div className={cn("border-t border-sidebar-border p-2", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(!collapsed && "w-full justify-start gap-3 px-2.5 text-muted-foreground")}
          >
            {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
            {!collapsed && "Collapse sidebar"}
          </Button>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 gap-0 bg-sidebar p-0">
          <SheetTitle className="flex h-14 items-center px-4">
            <RheoWordmark />
          </SheetTitle>
          <div className="py-2">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu aria-hidden />
          </Button>
          <div className="flex flex-1 items-center">
            <CommandPalette />
          </div>
          <div className="flex items-center gap-1">
            <NotificationsMenu />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
