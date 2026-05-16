import Link from "next/link";

import type { Product } from "@lumaops/core";
import { NavLinks } from "./nav-links";

export interface SidebarProps {
  readonly products: readonly Product[];
  readonly studioName?: string | null;
}

export function SidebarContent({ products, studioName }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 py-6">
      <Brand studioName={studioName ?? null} />
      <NavLinks />
      <ProductListSection products={products} />
    </div>
  );
}

function Brand({ studioName }: { studioName: string | null }) {
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
      {studioName ? (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
          {studioName}
        </p>
      ) : null}
    </div>
  );
}

function ProductListSection({ products }: { products: readonly Product[] }) {
  return (
    <div className="px-3">
      <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        Products
      </p>
      {products.length === 0 ? (
        <p className="px-3 text-xs text-ink-low">
          No products yet — run <code>pnpm core seed</code>.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.slug}` as never}
                className="flex items-center justify-between rounded-md px-3 py-1.5 text-xs text-ink-mid transition-colors hover:bg-paper-1 hover:text-ink"
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
                  {p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
