import { EmptyState } from "@lumaops/ui";

export default function SupportPage() {
  return (
    <EmptyState
      eyebrow="Support"
      title="Ticket pressure across all products."
      reason={{ kind: "not_connected", integration: "GitHub Issues / Support" }}
    />
  );
}
