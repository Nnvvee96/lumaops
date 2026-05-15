import { EmptyState } from "@lumaops/ui";

export default function RevenuePage() {
  return (
    <EmptyState
      eyebrow="Revenue"
      title="MRR, customers, churn — once Stripe is connected."
      reason={{ kind: "not_connected", integration: "Stripe" }}
    />
  );
}
