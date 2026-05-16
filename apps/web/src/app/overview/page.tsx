import { listIntegrations, listProducts, getStudio } from "@/lib/data";
import { FreshnessBadge } from "@lumaops/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const studio = await getStudio();
  if (!studio) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low">
          Overview
        </p>
        <h1 className="mt-3 text-3xl font-light tracking-tight">
          No studio configured.
        </h1>
        <p className="mt-3 text-sm text-ink-mid">
          Run <code>pnpm --filter @lumaops/core seed</code> to populate Navyug
          Studio + four proving-ground products.
        </p>
      </section>
    );
  }

  const products = await listProducts(studio.id);
  const integrations = await listIntegrations(studio.id);
  const liveIntegrations = integrations.filter((i) => i.state === "live").length;
  const pendingIntegrations = integrations.filter((i) => i.state === "pending").length;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      {/* Eyebrow + headline — landing num-tag + serif italic accent */}
      <NumTag label="Overview" />
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        Every product in{" "}
        <span className="font-serif italic text-ink">one</span> room.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        {studio.studioName ?? studio.name} · {studio.timezone} ·{" "}
        {studio.defaultCurrency}
      </p>

      {/* Studio summary grid — dense Mono metrics, no shadcn cards */}
      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCell
          label="Products"
          value={products.length.toString()}
          freshness={
            <FreshnessBadge
              freshness={{
                kind: "observed",
                last_observed_at: new Date(),
                source_id: "lumaops:db",
              }}
            />
          }
        />
        <SummaryCell
          label="Live"
          value={products.filter((p) => p.status === "live" || p.status === "active").length.toString()}
          freshness={
            <FreshnessBadge
              freshness={{
                kind: "observed",
                last_observed_at: new Date(),
                source_id: "lumaops:db",
              }}
            />
          }
        />
        <SummaryCell
          label="Beta · pre-launch"
          value={products.filter((p) => p.status === "beta" || p.status === "pre-launch").length.toString()}
          freshness={
            <FreshnessBadge
              freshness={{
                kind: "observed",
                last_observed_at: new Date(),
                source_id: "lumaops:db",
              }}
            />
          }
        />
        <SummaryCell
          label="Integrations"
          value={`${liveIntegrations}/${integrations.length}`}
          freshness={
            <FreshnessBadge
              freshness={{
                kind: "missing",
                reason: pendingIntegrations > 0 ? "integration_not_connected" : "no_integration",
              }}
            />
          }
        />
      </div>

      {/* Verb rows — landing signal-row pattern, the five public verbs */}
      <NumTag label="Five signals · one room" className="mt-16" />
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {[
          { verb: "shipped", note: "Releases. Connect GitHub to populate." },
          { verb: "converted", note: "Funnel events. Tracking API coming in Phase 6." },
          { verb: "earned", note: "Revenue. Stripe integration in Phase 6." },
          { verb: "broke", note: "Issues + crashes. GitHub support label live, telemetry in Phase 6." },
          { verb: "growing", note: "Telemetry + usage. App-telemetry endpoint Phase 6." },
        ].map((row, i) => (
          <li
            key={row.verb}
            className="grid grid-cols-[60px_1fr_auto] items-center gap-6 py-6"
          >
            <span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low">
              0{i + 1}
            </span>
            <span className="text-3xl font-light tracking-[-0.025em] text-ink">
              <span className="font-serif italic">{row.verb}</span>
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
              {row.note}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NumTag({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-low ${className ?? ""}`}
    >
      <span>{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function SummaryCell({
  label,
  value,
  freshness,
}: {
  label: string;
  value: string;
  freshness: React.ReactNode;
}) {
  return (
    <div className="bg-paper-1 p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
        {label}
      </p>
      <p className="mt-3 font-mono text-3xl font-light tabular-nums tracking-tight text-ink">
        {value}
      </p>
      <div className="mt-3">{freshness}</div>
    </div>
  );
}
