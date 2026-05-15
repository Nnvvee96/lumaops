# `@lumaops/ui`

Shared LumaOps UI primitives. Imported by every app surface.

Empty in S2C — composite primitives like `SourceLabel`, `FreshnessBadge`, and `ConnectorTile` arrive in S3D once the domain types they depend on (TDD §5.2 freshness taxonomy, TDD §3.3 integration state) exist.

## Hard rule — extend, don't add (cross-project [LL §10.4])

> Before adding a new component class, extend an existing primitive (chip, toggle, section, summary). The number of distinct primitives should grow slowly even as features grow fast. One-off classes drift visually over time and end up with N variants of "looks like a chip but slightly different".

When you reach for a new primitive in this package:

1. Look at what already exists here.
2. Look at what already exists in `apps/web/src/components/ui` (the shadcn-style atoms from S2C).
3. If neither fits, **extend** the closest existing primitive with a new variant prop — not a new component.
4. Only if extension genuinely cannot express the variant: add a new primitive, and document why the existing one couldn't be extended.

This rule applies to every variant of every primitive — chips, badges, source labels, freshness indicators, connector tiles, modal headers, etc.

## Layering

```
apps/web/src/components/ui/      shadcn atoms (Button, Card, Badge, …) — S2C
                                 Per-app; shadcn-style; rarely modified.

packages/ui/                     LumaOps composite primitives — S3D+
                                 Cross-app; LumaOps-specific; carry domain
                                 concepts (source, freshness, integration
                                 state). Extend the shadcn atoms above;
                                 never re-implement them.
```

## Source-label discipline (preview — full contract lives in TDD §6)

Any primitive that surfaces a path-like or machine-identifying field must strip absolute paths before rendering. `cross-project [LL §13.5]`. This is enforced at the primitive level so callers cannot accidentally leak.
