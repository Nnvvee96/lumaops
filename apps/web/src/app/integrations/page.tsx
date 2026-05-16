import { revalidatePath } from "next/cache";

import type { Integration } from "@lumaops/core";

import { getStudio, listIntegrations } from "@/lib/data";
import { testIntegrationConnection } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const studio = await getStudio();
  if (!studio) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <NumTag label="Integrations" />
        <h1 className="mt-4 text-3xl font-light tracking-tight">
          No studio yet.
        </h1>
        <p className="mt-3 text-sm text-ink-mid">
          The first-run UI lands in E-011. Until then, configure via the
          maintainer seed script.
        </p>
      </section>
    );
  }

  const integrations = await listIntegrations(studio.id);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <NumTag label="Integrations" />
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] lg:text-5xl">
        Bring your own tokens. <span className="font-serif italic">One</span> cockpit.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        Every integration runs against your own credentials. Tokens live only
        in your <code className="font-mono text-xs">.env</code> — LumaOps
        persists only their sha256 fingerprint.
      </p>

      {integrations.length === 0 ? (
        <p className="mt-12 text-sm text-ink-mid">
          No integrations attached yet. The Add Integration UI lands in Phase 5
          (see <code>docs/EXPANSION_BACKLOG.md</code> E-011 / Phase 4 follow-up).
        </p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {integrations.map((i) => (
            <IntegrationTile key={i.id} integration={i} />
          ))}
        </ul>
      )}
    </section>
  );
}

function IntegrationTile({ integration }: { integration: Integration }) {
  async function testConnection() {
    "use server";
    await testIntegrationConnection(integration.id);
    revalidatePath("/integrations");
  }

  return (
    <li className="flex flex-col gap-4 bg-paper-1 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-low">
            {integration.provider} · {integration.variant}
          </p>
          <p className="mt-2 text-lg text-ink">{integration.displayName}</p>
        </div>
        <StatePill state={integration.state} />
      </div>

      <dl className="grid grid-cols-1 gap-y-2 text-xs">
        <DataRow
          label="Credential"
          value={renderCredential(integration)}
        />
        <DataRow
          label="Last sync"
          value={
            integration.lastSyncAt
              ? formatRelative(integration.lastSyncAt)
              : "never"
          }
        />
        {integration.lastSyncError ? (
          <DataRow
            label="Last error"
            value={
              <span className="text-support">{integration.lastSyncError}</span>
            }
          />
        ) : null}
      </dl>

      <form action={testConnection}>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md border border-line-2 bg-paper-2 px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink hover:bg-paper-1"
        >
          Test connection
        </button>
      </form>
    </li>
  );
}

function renderCredential(integration: Integration): React.ReactNode {
  if (integration.credentialStatus === "present" && integration.credentialFingerprint) {
    return (
      <span className="font-mono text-[11px] text-ink">
        present · {integration.credentialFingerprint}
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] text-ink-mid">
      {integration.credentialStatus}
    </span>
  );
}

function StatePill({ state }: { state: Integration["state"] }) {
  const tone =
    state === "live"
      ? "border-growth/40 text-ink"
      : state === "error"
        ? "border-support/40 text-support"
        : state === "stale"
          ? "border-revenue/40 text-ink-mid"
          : "border-line text-ink-mid";
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border bg-paper-1/60 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
    >
      {state}
    </span>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        {label}
      </dt>
      <dd className="text-ink-mid">{value}</dd>
    </div>
  );
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
