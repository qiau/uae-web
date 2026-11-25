import { Bell } from "lucide-react";

import { SampleDataBadge } from "@/components/common/sample-data-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatRelative } from "@/lib/format";
import { sampleNotifications } from "@/features/notifications";

export function NotificationsMenu() {
  const unread = sampleNotifications.filter((item) => item.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] leading-none font-medium text-primary-foreground"
          >
            {unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between py-1.5">
            <span className="text-sm font-medium text-foreground">Notifications</span>
            <SampleDataBadge reason="Rheo has no notification service yet. These are examples." />
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {sampleNotifications.map((item) => (
          <DropdownMenuItem key={item.id} className="items-start gap-2 py-2">
            <span
              aria-hidden
              className={item.unread ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" : "mt-1.5 size-1.5 shrink-0"}
            />
            <span className="flex flex-col gap-0.5">
              <span className={item.unread ? "font-medium" : undefined}>
                {item.title}
                {item.unread && <span className="sr-only"> (unread)</span>}
              </span>
              <time dateTime={item.created_at} title={formatDateTime(item.created_at)} className="text-xs text-muted-foreground">
                {formatRelative(item.created_at)}
              </time>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
