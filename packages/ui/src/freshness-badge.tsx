/**
 * FreshnessBadge — the visible treatment of every Freshness state.
 *
 * Required prop: a Freshness from @lumaops/core/freshness. The
 * component type-refuses to render without one. Every classification
 * the calculator produces has a matching visible treatment here —
 * [LL §10.6] every classification state needs matching visible
 * treatment.
 *
 * Visual composition lifts from landing's `.pill` pattern:
 * - inline-flex pill with 1px line border
 * - mono caps text, wide letter-spacing
 * - 6px dot, with pulse for live states (CONCEPT §12.1 Lumi pulse)
 *
 * Colour palette per CONCEPT §12.1 — Lumi for live, ink-mid for
 * derived/inferred (annotation, not headline), support red for
 * stale and missing (operator must notice).
 */

import type { CSSProperties } from "react";

import type { Freshness } from "@lumaops/core";

export interface FreshnessBadgeProps {
  readonly freshness: Freshness;
  readonly className?: string;
  readonly style?: CSSProperties;
}

interface BadgeShape {
  readonly label: string;
  readonly detail?: string;
  /** "observed" pulses; "stale" + "missing" don't. */
  readonly dot: "lumi-pulse" | "lumi" | "support" | "ink-mid" | "none";
  /** Border colour key — maps to design tokens. */
  readonly tone: "line" | "support" | "ink-low";
}

function describe(freshness: Freshness): BadgeShape {
  switch (freshness.kind) {
    case "observed":
      return {
        label: "Observed",
        detail: formatRelative(freshness.last_observed_at),
        dot: "lumi-pulse",
        tone: "line",
      };
    case "derived":
      return {
        label: "Derived",
        detail: freshness.derivation,
        dot: "lumi",
        tone: "line",
      };
    case "inferred":
      return {
        label: "Inferred",
        detail: `confidence ${Math.round(freshness.confidence * 100)}%`,
        dot: "ink-mid",
        tone: "line",
      };
    case "stale": {
      const overdue = formatDuration(
        freshness.actual_age_seconds - freshness.threshold_seconds,
      );
      return {
        label: "Stale",
        detail: `${overdue} overdue`,
        dot: "support",
        tone: "support",
      };
    }
    case "missing": {
      const reasonText: Record<typeof freshness.reason, string> = {
        no_integration: "no integration",
        integration_not_connected: "not connected",
        no_data_yet: "no data yet",
      };
      return {
        label: "Missing",
        detail: reasonText[freshness.reason],
        dot: "none",
        tone: "ink-low",
      };
    }
    case "mock":
      return {
        label: "Mock",
        detail: `dev only · until ${formatDate(freshness.until)}`,
        dot: "lumi",
        tone: "support",
      };
  }
}

export function FreshnessBadge({
  freshness,
  className,
  style,
}: FreshnessBadgeProps) {
  const shape = describe(freshness);
  const borderColor =
    shape.tone === "support"
      ? "border-support/40"
      : shape.tone === "ink-low"
        ? "border-line-2"
        : "border-line";
  const base =
    "inline-flex items-center gap-2 h-[26px] px-3 rounded-full border " +
    "font-mono uppercase text-[10.5px] tracking-[0.08em] " +
    "bg-paper-1/60 text-ink-mid " +
    "w-fit justify-self-start max-w-full whitespace-nowrap";

  return (
    <span
      className={
        className ? `${base} ${borderColor} ${className}` : `${base} ${borderColor}`
      }
      style={style}
    >
      <Dot variant={shape.dot} />
      <span className="text-ink">{shape.label}</span>
      {shape.detail ? (
        <span aria-hidden="true" className="text-ink-low">
          ·
        </span>
      ) : null}
      {shape.detail ? <span>{shape.detail}</span> : null}
    </span>
  );
}

function Dot({ variant }: { variant: BadgeShape["dot"] }) {
  if (variant === "none") return null;
  const isPulse = variant === "lumi-pulse";
  const color =
    variant === "support"
      ? "var(--support)"
      : variant === "ink-mid"
        ? "var(--ink-mid)"
        : "var(--lumi)";
  return (
    <span
      aria-hidden="true"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 0 3px color-mix(in oklch, ${color} 30%, transparent)`,
        ...(isPulse
          ? { animation: "freshness-pulse 2.4s ease-in-out infinite" }
          : {}),
      }}
    />
  );
}

// ============================================================
// formatting helpers (local; do not need wider visibility)
// ============================================================

function formatRelative(d: Date, now: Date = new Date()): string {
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
