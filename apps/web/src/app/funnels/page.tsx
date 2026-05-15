import { EmptyState } from "@lumaops/ui";

export default function FunnelsPage() {
  return (
    <EmptyState
      eyebrow="Funnels"
      title="Conversion funnels per product."
      reason={{ kind: "not_connected", integration: "Custom Tracking API" }}
    />
  );
}
