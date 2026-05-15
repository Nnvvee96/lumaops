import { EmptyState } from "@lumaops/ui";

export default function TelemetryPage() {
  return (
    <EmptyState
      eyebrow="Telemetry"
      title="Privacy-safe product usage signals."
      reason={{ kind: "not_connected", integration: "App Telemetry endpoint" }}
    />
  );
}
