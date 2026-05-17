import Link from "next/link";

import { EmptyState, FreshnessBadge, SourceLabel } from "@lumaops/ui";

import { getStudio } from "@/lib/data";
import { listReleaseSurfaces, type ReleaseSurface } from "@/lib/github-surfaces";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const studio = await getStudio();
  if (!studio) {
    return (
      <EmptyState
        eyebrow="Releases"
        title="Release history + asset health."
        reason={{ kind: "not_connected", integration: "GitHub" }}
      />
    );
  }

  const surfaces = await listReleaseSurfaces(studio.id);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <NumTag label="Releases" />
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        Release <span className="font-serif italic">cadence</span> across products.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        Latest published release per product, with asset health and download
        counts. Sourced directly from GitHub — nothing is invented.
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {surfaces.map((s) => (
          <ReleaseRow key={s.productId} surface={s} />
        ))}
      </ul>
    </section>
  );
}

function ReleaseRow({ surface }: { surface: ReleaseSurface }) {
  const { latest, freshness, productName, productSlug, integration } = surface;
  const lastSyncAt = integration?.lastSyncAt ?? null;

  return (
    <li className="flex flex-col gap-4 bg-paper-1 p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            Product
          </p>
          <Link
            href={`/products/${productSlug}`}
            className="mt-1 inline-block text-2xl text-ink hover:underline"
          >
            {productName}
          </Link>
        </div>
        <FreshnessBadge freshness={freshness} />
      </div>

      {latest ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-base text-ink">{latest.tagName}</span>
            {latest.name && latest.name !== latest.tagName ? (
              <span className="text-sm text-ink-mid">{latest.name}</span>
            ) : null}
            {latest.prerelease ? (
              <span className="inline-flex items-center rounded-full border border-revenue/40 bg-paper-2 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mid">
                Prerelease
              </span>
            ) : null}
          </div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-low">
            Published {formatRelative(latest.publishedAt)}
          </p>
          {latest.assets.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2">
              {latest.assets.map((a) => (
                <li
                  key={a.name}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line-2 pt-2 text-sm"
                >
                  <span className="font-mono text-ink">{a.name}</span>
                  <span className="font-mono text-[11px] text-ink-mid">
                    {formatBytes(a.sizeBytes)} · {a.downloadCount} downloads
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-mid">
          No release events ingested for this product yet.
        </p>
      )}

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

function formatRelative(d: Date, now: Date = new Date()): string {
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
