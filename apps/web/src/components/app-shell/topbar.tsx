import { Menu } from "lucide-react";

import type { Product } from "@lumaops/core";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

import { SidebarContent } from "./sidebar";

export interface TopbarProps {
  readonly products: readonly Product[];
  readonly studioName?: string | null;
}

export function Topbar({ products, studioName }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-paper/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-paper/80 lg:px-6">
      {/* Mobile burger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="text-ink-mid hover:text-ink"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">LumaOps navigation</SheetTitle>
            <SidebarContent products={products} studioName={studioName ?? null} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low sm:inline">
          {products.length} {products.length === 1 ? "product" : "products"} ·
          integrations pending
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
