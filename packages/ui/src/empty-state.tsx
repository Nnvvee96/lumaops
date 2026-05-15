import type { ReactNode } from "react";

/**
 * EmptyState — the honest empty-surface primitive.
 *
 * Used wherever a route or section has nothing to show. The "reason"
 * is required and structurally typed so callers cannot accidentally
 * substitute fake metric numbers. ([LL §8.4] Honest data labels —
 * stale/inferred/missing must be visible at the schema level, not
 * eyeballed at the UI level.)
 */

export type EmptyReason =
  | { kind: "not_connected"; integration: string }
  | { kind: "no_data_yet"; needsAction?: string | undefined }
  | { kind: "planned"; phase: string }
  | { kind: "missing"; description: string };

export interface EmptyStateProps {
  /** Short route / section label rendered as a mono eyebrow. */
  eyebrow: string;
  /** One-line description of what this surface will show. */
  title: string;
  /** Why is it empty? */
  reason: EmptyReason;
  /** Optional secondary content (e.g. CTA, doc link). */
  children?: ReactNode | undefined;
}

const REASON_BADGES: Record<EmptyReason["kind"], string> = {
  not_connected: "Not connected",
  no_data_yet: "No data yet",
  planned: "Planned",
  missing: "Missing",
};

function reasonText(reason: EmptyReason): string {
  switch (reason.kind) {
    case "not_connected":
      return `Connect the ${reason.integration} integration to populate this view.`;
    case "no_data_yet":
      return reason.needsAction ?? "Once events arrive, this surface populates automatically.";
    case "planned":
      return `Surface lands in ${reason.phase}.`;
    case "missing":
      return reason.description;
  }
}

export function EmptyState({ eyebrow, title, reason, children }: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8 lg:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-light tracking-tight text-ink">
        {title}
      </h1>

      <div className="mt-6 inline-flex items-center gap-3 rounded-md border border-border bg-paper-1 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
          {REASON_BADGES[reason.kind]}
        </span>
        <span className="text-sm text-ink-mid">{reasonText(reason)}</span>
      </div>

      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
