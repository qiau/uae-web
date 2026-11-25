import { LayoutDashboard, LayoutGrid, ListChecks, Stamp, Workflow, type LucideIcon } from "lucide-react";

import type { Role } from "@/types/api";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles from uae-backend that can use this screen. Hiding is not security. */
  roles: Role[];
  /** The screen runs on sample data because the backend has no endpoint yet. */
  sample?: boolean;
};

// Every backend endpoint in MVP 1 requires "requester", which every user gets
// on first login. Approvals and jobs have no endpoints or roles yet, so they
// are shown to everyone as sample-data previews.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["requester"] },
  { href: "/services", label: "Service catalog", icon: LayoutGrid, roles: ["requester"] },
  { href: "/requests", label: "My requests", icon: ListChecks, roles: ["requester"] },
  { href: "/approvals", label: "Approvals", icon: Stamp, roles: ["requester"], sample: true },
  { href: "/jobs", label: "Automation jobs", icon: Workflow, roles: ["requester"], sample: true },
];

/**
 * Roles the UI assumes for the signed-in user. The backend has no /me endpoint,
 * so the only certain role is "requester" (granted to everyone at first login).
 */
export const ASSUMED_ROLES: Role[] = ["requester"];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
