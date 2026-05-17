import Link from "next/link";

import { EmptyState, FreshnessBadge, SourceLabel } from "@lumaops/ui";

import { getStudio } from "@/lib/data";
import { listSupportSurfaces, type SupportSurface } from "@/lib/github-surfaces";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const studio = await getStudio();
  if (!studio) {
    return (
      <EmptyState
        eyebrow="Support"
        title="Ticket pressure across products."
        reason={{ kind: "not_connected", integration: "GitHub Issues / Support" }}
      />
    );
  }

  const surfaces = await listSupportSurfaces(studio.id);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <NumTag label="Support" />
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        Ticket <span className="font-serif italic">pressure</span> across products.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        Issues labelled <code className="font-mono text-xs">bug</code> or{" "}
        <code className="font-mono text-xs">support</code> from each product&apos;s
        GitHub repo. MVP is surface-only — native reply is a Phase 4+ decision
        (MEMORY §1.1 Decision F).
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
        {surfaces.map((s) => (
          <SupportRow key={s.productId} surface={s} />
        ))}
      </ul>
    </section>
  );
}

function SupportRow({ surface }: { surface: SupportSurface }) {
  const { freshness, productName, productSlug, integration } = surface;
  const lastSyncAt = integration?.lastSyncAt ?? null;
  const total = surface.openCount + surface.closedCount;

  return (
    <li className="flex flex-col gap-4 bg-paper-1 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            Product
          </p>
          <Link
            href={`/products/${productSlug}`}
            className="mt-1 inline-block text-xl text-ink hover:underline"
          >
            {productName}
          </Link>
        </div>
        <FreshnessBadge freshness={freshness} />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        {surface.openCount > 0 ? (
          <Cell label="Open" value={String(surface.openCount)} accent="support" />
        ) : (
          <Cell label="Open" value="0" />
        )}
        <Cell label="Closed" value={String(surface.closedCount)} />
        <Cell label="Bug-labelled" value={String(surface.labels.bug)} />
        <Cell label="Support-labelled" value={String(surface.labels.support)} />
      </dl>

      {total === 0 ? (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-low">
          No support tickets ingested for this product yet.
        </p>
      ) : null}

      {lastSyncAt ? (
        <SourceLabel
          source="github"
          syncedAt={lastSyncAt}
          {...sourceDetail(integration?.config)}
          size="micro"
        />
      ) : null}
    </li>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "support";
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        {label}
      </dt>
      <dd
        className={
          accent === "support"
            ? "text-2xl text-support"
            : "text-2xl text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function sourceDetail(config: unknown): { detail?: string } {
  if (!config || typeof config !== "object") return {};
  const ownerRepo = (config as Record<string, unknown>)["owner_repo"];
  if (typeof ownerRepo !== "string" || ownerRepo.length === 0) return {};
  return { detail: ownerRepo };
}

function NumTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
      <span>{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
