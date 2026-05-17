/**
 * Framework-wide error classification per TDD §8.
 *
 * Any thrown error from any layer (connector, persistence, validation,
 * internal) lifts to one of these 10 classes. The class drives:
 * - the operator-visible message,
 * - the recovery action,
 * - the auto-retry decision,
 * - the state-machine impact on the originating integration/row.
 *
 * The classifier is a pure function — adapters classify their own
 * errors locally and emit `ConnectorError.kind` (7 narrow connector
 * kinds). The framework runner lifts those to `ErrorClass` (10 broad
 * classes including persistence + validation + internal).
 */

export type ErrorClass =
  | "connector_auth"
  | "connector_rate_limit"
  | "connector_schema_drift"
  | "connector_network"
  | "connector_permission"
  | "connector_not_found"
  | "persistence_db"
  | "persistence_constraint"
  | "validation_input"
  | "internal_bug";

/**
 * Map a `ConnectorError.kind` (adapter-local taxonomy) up to the
 * framework's `ErrorClass`. Adapters do not import `ErrorClass`
 * directly — they emit `kind`, and the runner lifts via this
 * function. Pure, total, deterministic.
 */
import type { ConnectorErrorKind } from "../connectors/contract";

export function connectorKindToErrorClass(
  kind: ConnectorErrorKind,
): ErrorClass {
  switch (kind) {
    case "auth":
      return "connector_auth";
    case "rate_limit":
      return "connector_rate_limit";
    case "schema_drift":
      return "connector_schema_drift";
    case "network":
      return "connector_network";
    case "permission":
      return "connector_permission";
    case "not_found":
      return "connector_not_found";
    case "unknown":
      return "internal_bug";
  }
}
