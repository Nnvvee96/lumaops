/**
 * Adapter registry — locked to a `(provider, variant)` lookup.
 *
 * Core defines the registry shape. The web app composes the registry
 * by importing connectors at boot. This keeps `@lumaops/core` from
 * directly importing `@lumaops/connectors` (which would invert the
 * dependency arrow — connectors already depends on core).
 */

import type { ConnectorAdapter } from "../connectors/contract";
import type { IntegrationProvider } from "../db/schema";

export interface AdapterRegistry {
  /** Returns the adapter for `(provider, variant)`, or null if unknown. */
  get(provider: IntegrationProvider, variant: string): ConnectorAdapter | null;
}

/**
 * In-memory registry. Adapters are immutable; the registry is built once
 * at boot. No re-registration after first lookup to avoid race conditions
 * in long-running processes.
 */
export class MutableAdapterRegistry implements AdapterRegistry {
  readonly #byKey = new Map<string, ConnectorAdapter>();

  register(adapter: ConnectorAdapter): void {
    const key = keyOf(adapter.provider, adapter.variant);
    if (this.#byKey.has(key)) {
      throw new Error(
        `[sync/registry] duplicate adapter for ${key} — registries are immutable after first registration`,
      );
    }
    this.#byKey.set(key, adapter);
  }

  get(provider: IntegrationProvider, variant: string): ConnectorAdapter | null {
    return this.#byKey.get(keyOf(provider, variant)) ?? null;
  }
}

function keyOf(provider: IntegrationProvider, variant: string): string {
  return `${provider}::${variant}`;
}
