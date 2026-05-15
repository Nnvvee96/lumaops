import { EmptyState } from "@lumaops/ui";

export default function OverviewPage() {
  return (
    <EmptyState
      eyebrow="Overview"
      title="Five signals, one room — once integrations sync."
      reason={{ kind: "no_data_yet" }}
    />
  );
}
