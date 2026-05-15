import { EmptyState } from "@lumaops/ui";

export default function IntegrationsPage() {
  return (
    <EmptyState
      eyebrow="Integrations"
      title="Bring your own tokens. Self-hosted, local-first."
      reason={{ kind: "no_data_yet", needsAction: "Integration tiles land in Phase 4 (GitHub) and Phase 6 (Cloudflare, Stripe, telemetry, support)." }}
    />
  );
}
