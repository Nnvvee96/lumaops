import { EmptyState } from "@lumaops/ui";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <EmptyState
      eyebrow={`Product · ${slug}`}
      title="Single-product cockpit lands in Phase 3."
      reason={{ kind: "planned", phase: "Phase 3 — Core Domain" }}
    />
  );
}
