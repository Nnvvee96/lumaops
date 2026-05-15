# LumaOps Landing (`lumaops.app`)

Public marketing site for LumaOps. **Separate** from the product cockpit (`apps/web`, planned).

## Stack

Intentionally minimal — no build step.

- Static HTML/CSS
- React 18 + Babel Standalone via CDN (in-browser JSX compilation)
- Geist + Geist Mono + Instrument Serif via Google Fonts
- Source: handoff from Claude Design

## Local preview

Any static file server works:

```sh
cd apps/landing
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (Cloudflare Pages)

- Build command: *(none)*
- Build output directory: `apps/landing`
- Root directory: repo root

## Notes

- `tweaks-panel.jsx` (Claude Design's in-browser editor overlay) is intentionally **not** loaded in production. `src/app.jsx` falls back to defaults when `window.useTweaks` is absent.
- This stack is a deliberate exception to the app-stack in `docs/TECHSTACK.md`. The product cockpit will be Next.js + TypeScript + Tailwind under `apps/web`.
- Port to Next.js is a Phase-2 option once the cockpit app exists and we want a single build pipeline.
