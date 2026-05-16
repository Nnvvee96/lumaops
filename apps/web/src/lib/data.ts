import "server-only";

import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";

import {
  integration,
  product,
  workspace,
  type Product,
  type Integration,
  type Workspace,
} from "@lumaops/core";

import { getDb } from "./db";

/**
 * MVP single-tenant: there's exactly one workspace. The seed pins it
 * at a known UUID; if no row exists yet we return null so the UI can
 * render an "uninitialised" empty state.
 */
export const getStudio = cache(async (): Promise<Workspace | null> => {
  const rows = await getDb().select().from(workspace).limit(1);
  return rows[0] ?? null;
});

export const listProducts = cache(
  async (workspaceId: string): Promise<readonly Product[]> => {
    return getDb()
      .select()
      .from(product)
      .where(and(eq(product.workspaceId, workspaceId), isNull(product.archivedAt)))
      .orderBy(asc(product.name));
  },
);

export const getProductBySlug = cache(
  async (workspaceId: string, slug: string): Promise<Product | null> => {
    const rows = await getDb()
      .select()
      .from(product)
      .where(and(eq(product.workspaceId, workspaceId), eq(product.slug, slug)))
      .limit(1);
    return rows[0] ?? null;
  },
);

export const listIntegrations = cache(
  async (workspaceId: string): Promise<readonly Integration[]> => {
    return getDb().select().from(integration).where(eq(integration.workspaceId, workspaceId));
  },
);

export const listIntegrationsForProduct = cache(
  async (workspaceId: string, productId: string): Promise<readonly Integration[]> => {
    return getDb()
      .select()
      .from(integration)
      .where(
        and(eq(integration.workspaceId, workspaceId), eq(integration.productId, productId)),
      );
  },
);
