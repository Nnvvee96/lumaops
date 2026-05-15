import { EmptyState } from "@lumaops/ui";

export default function ReleasesPage() {
  return (
    <EmptyState
      eyebrow="Releases"
      title="Release history + asset health."
      reason={{ kind: "not_connected", integration: "GitHub" }}
    />
  );
}
