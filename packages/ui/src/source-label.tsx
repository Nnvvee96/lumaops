/**
 * SourceLabel — the "via Cloudflare · synced 14:32" primitive.
 *
 * Required props: a source provider name + a syncedAt timestamp. The
 * component type-refuses to render without both — callers cannot
 * substitute "1,234 visits" without source attribution
 * (CONCEPT §18.2 Promise #4, [LL §8.4]).
 *
 * Visual composition lifts from landing's `.num-tag` / `.micro` pattern:
 * mono uppercase, wide letter-spacing, ink-low color, no decoration.
 * (CONCEPT §12.5 — Visual Fidelity Standard.)
 */

import type { CSSProperties } from "react";

import { stripAbsolutePath } from "./sanitize";

/**
 * Source enum mirrors `event_source` in TDD §3.4. Kept as a local
 * string union so packages/ui does not pull the Drizzle schema into
 * the UI bundle. Update both when a new source ships.
 */
export type SourceName =
  | "github"
  | "cloudflare"
  | "stripe"
  | "tracking-api"
  | "app-telemetry"
  | "support"
  | "email"
  | "custom"
  | "manual"
  | "seed";

const SOURCE_DISPLAY: Record<SourceName, string> = {
  github: "GitHub",
  cloudflare: "Cloudflare",
  stripe: "Stripe",
  "tracking-api": "Tracking API",
  "app-telemetry": "Telemetry",
  support: "Support",
  email: "Email",
  custom: "Custom",
  manual: "Manual",
  seed: "Seed",
};

export interface SourceLabelProps {
  /** Provider name from `event_source` taxonomy. Required. */
  readonly source: SourceName;
  /** When the source was last synced. Required. */
  readonly syncedAt: Date;
  /**
   * Optional inline ID after the source (e.g. repo slug, integration id).
   * Sanitised against absolute-path leakage at render time.
   */
  readonly detail?: string;
  /** Visual size — micro for in-row, default for standalone. */
  readonly size?: "micro" | "default";
  readonly className?: string;
  readonly style?: CSSProperties;
}

function formatSyncedAt(d: Date): string {
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export function SourceLabel({
  source,
  syncedAt,
  detail,
  size = "default",
  className,
  style,
}: SourceLabelProps) {
  const cleanDetail = detail !== undefined ? stripAbsolutePath(detail) : undefined;
  const baseClasses =
    size === "micro"
      ? "font-mono uppercase tracking-[0.14em] text-[10px] text-ink-low"
      : "font-mono uppercase tracking-[0.16em] text-[11px] text-ink-low";
  return (
    <span
      className={className ? `${baseClasses} ${className}` : baseClasses}
      style={style}
    >
      via {SOURCE_DISPLAY[source]}
      {cleanDetail ? <span> · {cleanDetail}</span> : null}
      <span> · synced {formatSyncedAt(syncedAt)}</span>
    </span>
  );
}
