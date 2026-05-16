import { notFound } from "next/navigation";

import {
  getDefaultMetricForType,
  getMetricDefinition,
  type IntegrationProvider,
} from "@lumaops/core";
import { EmptyState, FreshnessBadge, SourceLabel } from "@lumaops/ui";

import {
  getProductBySlug,
  getStudio,
  listIntegrationsForProduct,
} from "@/lib/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const studio = await getStudio();
  if (!studio) notFound();

  const product = await getProductBySlug(studio.id, slug);
  if (!product) notFound();

  const integrations = await listIntegrationsForProduct(studio.id, product.id);

  const metricKey = getDefaultMetricForType(product.productType, product.status);
  const metricDef = getMetricDefinition(metricKey);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      {/* Eyebrow */}
      <div className="flex items-center gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
        <span>Product · {product.status} · {product.productType}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        {product.name}
      </h1>
      <p className="mt-3 text-sm text-ink-mid">
        {product.websiteDomain ?? "no domain"} ·{" "}
        {product.githubOwnerRepo ?? "no repo"}
      </p>

      {/* Primary metric — dense Mono stat with source + freshness */}
      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <div className="bg-paper-1 p-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            Primary metric
          </p>
          <p className="mt-3 text-sm text-ink">{metricDef?.label ?? metricKey}</p>
          <p className="mt-1 font-mono text-3xl font-light tabular-nums tracking-tight text-ink-low">
            —
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <FreshnessBadge
              freshness={{
                kind: "missing",
                reason: "integration_not_connected",
              }}
            />
            <SourceLabel
              source="seed"
              syncedAt={product.createdAt}
              detail={product.slug}
              size="micro"
            />
          </div>
        </div>
        <div className="bg-paper-1 p-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            Integrations
          </p>
          {integrations.length === 0 ? (
            <p className="mt-3 text-sm text-ink-mid">
              No integrations attached yet. GitHub connector lands in Phase 4.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {integrations.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-ink">{i.displayName}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                    {i.state}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tab strip — only Overview + Settings have content this slice (per S3G plan).
          Funnel/Traffic/Downloads/Revenue/Releases/Support/Telemetry placeholders. */}
      <div className="mt-16 flex items-center gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
        <span>Cockpit tabs</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Overview", state: "ready" },
          { label: "Funnel", state: "planned" },
          { label: "Releases", state: "phase 4" },
          { label: "Support", state: "phase 4" },
          { label: "Downloads", state: "phase 6" },
          { label: "Revenue", state: "phase 6" },
          { label: "Users", state: "phase 6" },
          { label: "Telemetry", state: "phase 6" },
          { label: "Settings", state: "ready" },
          { label: "Integrations", state: "phase 4" },
        ].map((tab) => (
          <li
            key={tab.label}
            className="bg-paper-1 px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-low"
          >
            <p className="text-ink">{tab.label}</p>
            <p className="mt-0.5">{tab.state}</p>
          </li>
        ))}
      </ul>

      {/* "Settings" surface — minimum honest content for this slice */}
      <div className="mt-16">
        <EmptyState
          eyebrow="Settings"
          title="Per-product configuration."
          reason={{
            kind: "no_data_yet",
            needsAction:
              "Editable fields (status, primary metric override, integration toggles) land in Phase 5 Visual Hardening.",
          }}
        />
      </div>
    </section>
  );
}

// Suppress unused-import warning for the placeholder type until the next slice consumes it.
type _ReservedForS4 = IntegrationProvider;
void (null as unknown as _ReservedForS4);
