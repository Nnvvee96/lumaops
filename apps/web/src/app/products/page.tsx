import { EmptyState } from "@lumaops/ui";

export default function ProductsPage() {
  return (
    <EmptyState
      eyebrow="Products"
      title="Every product in your studio, in one view."
      reason={{ kind: "no_data_yet", needsAction: "Seed your first product in Phase 3 / Slice S3F." }}
    />
  );
}
