export { nextState } from "./state-machine";
export type {
  SyncEvent,
  StateTransition,
  IllegalTransitionError,
} from "./state-machine";

export { MutableAdapterRegistry } from "./registry";
export type { AdapterRegistry } from "./registry";

export { runSync } from "./runner";
export type { RunSyncOptions, RunSyncResult } from "./runner";

export { indexByProviderVariant } from "./store";
export type {
  SyncStore,
  IntegrationStatePatch,
  InsertEventsResult,
} from "./store";
