// Primary sidebar nav. Mirrors CONCEPT §6 Left Sidebar.
// Product list section is appended below this in the Sidebar component
// once seeded data exists (S3F).

import type { Route } from "next";
import {
  LayoutDashboard,
  Boxes,
  GitBranch,
  Activity,
  Banknote,
  Tag,
  LifeBuoy,
  PlugZap,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview",     href: "/overview"     as Route, icon: LayoutDashboard },
  { label: "Products",     href: "/products"     as Route, icon: Boxes },
  { label: "Funnels",      href: "/funnels"      as Route, icon: GitBranch },
  { label: "Revenue",      href: "/revenue"      as Route, icon: Banknote },
  { label: "Releases",     href: "/releases"     as Route, icon: Tag },
  { label: "Support",      href: "/support"      as Route, icon: LifeBuoy },
  { label: "Telemetry",    href: "/telemetry"    as Route, icon: Activity },
  { label: "Integrations", href: "/integrations" as Route, icon: PlugZap },
  { label: "Settings",     href: "/settings"     as Route, icon: Settings },
] as const;
