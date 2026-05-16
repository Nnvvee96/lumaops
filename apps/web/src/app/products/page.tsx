import Link from "next/link";

import { getDefaultMetricForType, getMetricDefinition, type Product } from "@lumaops/core";
import { listProducts, getStudio, listIntegrations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const studio = await getStudio();
  if (!studio) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
          Products
        </p>
        <h1 className="mt-3 text-3xl font-light tracking-tight">
          No studio yet.
        </h1>
        <p className="mt-3 text-sm text-ink-mid">
          Run <code>pnpm --filter @lumaops/core seed</code> to populate.
        </p>
      </section>
    );
  }

  const products = await listProducts(studio.id);
  const integrations = await listIntegrations(studio.id);
  const integrationCount = new Map<string, number>();
  for (const i of integrations) {
    if (i.productId) {
      integrationCount.set(i.productId, (integrationCount.get(i.productId) ?? 0) + 1);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex items-center gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
        <span>Products</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        Every product. <span className="font-serif italic">One</span> studio.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        {products.length} {products.length === 1 ? "product" : "products"} in{" "}
        {studio.studioName ?? studio.name}.
      </p>

      <ProductTable products={products} integrationCount={integrationCount} />
    </section>
  );
}

function ProductTable({
  products,
  integrationCount,
}: {
  products: readonly Product[];
  integrationCount: Map<string, number>;
}) {
  return (
    <div className="mt-12 overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            <th className="py-3 pr-6 font-normal">Product</th>
            <th className="py-3 pr-6 font-normal">Status</th>
            <th className="py-3 pr-6 font-normal">Type</th>
            <th className="py-3 pr-6 font-normal">Primary metric</th>
            <th className="py-3 pr-6 font-normal">Integrations</th>
            <th className="py-3 pr-6 font-normal">Website</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const metricKey = getDefaultMetricForType(p.productType, p.status);
            const metricDef = getMetricDefinition(metricKey);
            const integrations = integrationCount.get(p.id) ?? 0;
            return (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-paper-1/40"
              >
                <td className="py-5 pr-6">
                  <Link
                    href={`/products/${p.slug}` as never}
                    className="text-base text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="py-5 pr-6">
                  <StatusPill status={p.status} />
                </td>
                <td className="py-5 pr-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mid">
                  {p.productType}
                </td>
                <td className="py-5 pr-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-ink">
                      {metricDef?.label ?? metricKey}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                      {metricKey}
                    </span>
                  </div>
                </td>
                <td className="py-5 pr-6 font-mono text-sm tabular-nums text-ink-mid">
                  {integrations === 0 ? "—" : integrations}
                </td>
                <td className="py-5 pr-6 font-mono text-[11px] text-ink-mid">
                  {p.websiteDomain ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: Product["status"] }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-line bg-paper-1/60 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mid">
      {status}
    </span>
  );
}
