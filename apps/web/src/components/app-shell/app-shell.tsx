import type { ReactNode } from "react";

import { getStudio, listProducts } from "@/lib/data";

import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";

export async function AppShell({ children }: { children: ReactNode }) {
  const studio = await getStudio();
  const products = studio ? await listProducts(studio.id) : [];
  const studioName = studio?.studioName ?? null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop sidebar — fixed left rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-paper-1 lg:block">
        <SidebarContent products={products} studioName={studioName} />
      </aside>

      {/* Main column — Topbar (with mobile burger) + content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar products={products} studioName={studioName} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
