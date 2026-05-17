"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  syncNowAction,
  cancelSyncAction,
  type SyncNowResult,
} from "@/lib/sync-actions";

interface Props {
  readonly integrationId: string;
}

/**
 * Server-action driven sync trigger. The button:
 *  - Calls `syncNowAction` and renders an in-flight state while it runs.
 *  - Surfaces a Cancel button after a brief grace window — clicking it
 *    fires `cancelSyncAction`, which aborts the controller server-side.
 *  - Shows the post-run summary inline (success counts or error).
 *
 * The resource-cost label below the button applies `[LL §9.1]` —
 * operators see the cost before clicking, not after.
 */
export function SyncNowButton({ integrationId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SyncNowResult | null>(null);

  async function onSync() {
    setPending(true);
    setResult(null);
    try {
      const r = await syncNowAction(integrationId);
      setResult(r);
      router.refresh();
    } catch (err) {
      setResult({
        ok: false,
        state: "error",
        attempted: 0,
        inserted: 0,
        deduped: 0,
        errorSummary: err instanceof Error ? err.message : String(err),
        affectedScopes: [],
      });
    } finally {
      setPending(false);
    }
  }

  async function onCancel() {
    await cancelSyncAction(integrationId);
    // `syncNowAction` will return shortly with the aborted result; the
    // setPending(false) in its finally handles UI cleanup.
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSync}
          disabled={pending}
          className="inline-flex h-9 items-center rounded-md border border-line-2 bg-paper-2 px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink hover:bg-paper-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Syncing…" : "Sync now"}
        </button>
        {pending ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-md border border-support/40 bg-paper-1 px-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-support hover:border-support hover:text-support"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-low">
        Hits GitHub · uses rate budget
      </p>
      {result ? <ResultRow r={result} /> : null}
    </div>
  );
}

function ResultRow({ r }: { r: SyncNowResult }) {
  if (r.ok) {
    return (
      <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mid">
        Synced · {r.inserted} new
        {r.deduped > 0 ? ` · ${r.deduped} deduped` : ""}
      </p>
    );
  }
  return (
    <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-support">
      {r.errorSummary ?? "Sync failed"}
    </p>
  );
}
