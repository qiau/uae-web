import { FilePlus2, Monitor, Moon, Search, Sun, type LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";

import { useTheme } from "@/components/theme/theme-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { ASSUMED_ROLES, NAV_ITEMS } from "./nav";

type Command = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const listId = useId();

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => navigate(href);
    return [
      ...NAV_ITEMS.filter((item) => item.roles.some((role) => ASSUMED_ROLES.includes(role))).map((item) => ({
        id: item.href,
        label: item.label,
        group: "Go to",
        icon: item.icon,
        run: go(item.href),
      })),
      { id: "new", label: "New request", group: "Actions", icon: FilePlus2, run: go("/requests/new") },
      { id: "light", label: "Use light theme", group: "Theme", icon: Sun, run: () => setTheme("light") },
      { id: "dark", label: "Use dark theme", group: "Theme", icon: Moon, run: () => setTheme("dark") },
      { id: "system", label: "Match system theme", group: "Theme", icon: Monitor, run: () => setTheme("system") },
    ];
  }, [navigate, setTheme]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? commands.filter((command) => command.label.toLowerCase().includes(needle)) : commands;
  }, [commands, query]);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  function runCommand(command: Command) {
    changeOpen(false);
    command.run();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      runCommand(results[activeIndex]);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => changeOpen(true)}
        className="h-8 w-full max-w-72 justify-start gap-2 bg-card px-2.5 font-normal text-muted-foreground"
      >
        <Search aria-hidden />
        <span className="flex-1 text-left">Search</span>
        <kbd className="hidden rounded-sm border px-1 font-mono text-xs sm:inline">Ctrl K</kbd>
      </Button>

      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent showCloseButton={false} className="top-[20%] translate-y-0 gap-0 p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Search Rheo</DialogTitle>
          <DialogDescription className="sr-only">
            Type to filter pages and actions. Use the arrow keys to move and Enter to open.
          </DialogDescription>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined}
              aria-label="Search pages and actions"
              placeholder="Search pages and actions"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-sm text-muted-foreground">No pages or actions match “{query}”.</li>
            )}
            {results.map((command, index) => {
              const Icon = command.icon;
              const showGroup = index === 0 || results[index - 1].group !== command.group;
              return (
                <li key={command.id} role="presentation">
                  {showGroup && <div className="px-2 pt-2 pb-1 text-xs text-muted-foreground">{command.group}</div>}
                  <div
                    id={`${listId}-${command.id}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => runCommand(command)}
                    className={cn(
                      "flex h-9 cursor-default items-center gap-2 rounded-md px-2 text-sm",
                      index === activeIndex && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {command.label}
                  </div>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
