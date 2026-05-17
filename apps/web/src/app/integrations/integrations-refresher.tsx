"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Schedule {
  readonly integrationId: string;
  /** Seconds until this integration crosses its freshness threshold. */
  readonly secondsUntilStale: number;
}

interface Props {
  readonly schedules: readonly Schedule[];
}

/**
 * Two refresh triggers wired into the page:
 *
 *  1. **Focus refresh** ([LL §10.2]). Every time the operator brings
 *     the tab back, we re-fetch — covers `git pull && sync && tab back`.
 *
 *  2. **Freshness timers**. One `setTimeout` per integration set to
 *     fire `freshness_threshold_seconds + 5s` after `last_sync_at`.
 *     The 5s buffer keeps the UI from flickering between live and
 *     stale at the exact boundary.
 *
 * Both trigger `router.refresh()`, which re-runs the server component
 * — `listIntegrations` runs again, `effectiveState` derives `stale`,
 * tile re-renders with the new pill.
 */
export function IntegrationsRefresher({ schedules }: Props) {
  const router = useRouter();

  // 1) Focus refresh
  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  // 2) Freshness timers
  useEffect(() => {
    const handles = schedules
      .filter((s) => s.secondsUntilStale > 0)
      .map((s) => {
        const ms = s.secondsUntilStale * 1000 + 5_000;
        return setTimeout(() => router.refresh(), ms);
      });
    return () => handles.forEach(clearTimeout);
  }, [schedules, router]);

  return null;
}
