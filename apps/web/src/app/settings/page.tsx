import { EmptyState } from "@lumaops/ui";

export default function SettingsPage() {
  return (
    <EmptyState
      eyebrow="Settings"
      title="Workspace / Studio configuration."
      reason={{ kind: "planned", phase: "Phase 3 — Core Domain" }}
    />
  );
}
