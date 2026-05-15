"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 py-6">
      <Brand />
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(onNavigate ? { onClick: onNavigate } : {})}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-paper-2 text-ink"
                  : "text-ink-mid hover:bg-paper-1 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <ProductListSection />
    </div>
  );
}

function Brand() {
  return (
    <div className="px-6">
      <Link
        href={"/" as never}
        className="flex items-center gap-2 text-sm font-medium text-ink"
        aria-label="LumaOps home"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-lumi shadow-[0_0_0_3px_color-mix(in_oklch,var(--lumi)_30%,transparent)]" />
        LumaOps
      </Link>
    </div>
  );
}

function ProductListSection() {
  // Seeded products appear in S3F. Empty state is the honest MVP
  // baseline ([LL §8.4] — never fake numbers).
  return (
    <div className="px-3">
      <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        Products
      </p>
      <p className="px-3 text-xs text-ink-low">No products yet — seeded in S3F.</p>
    </div>
  );
}
