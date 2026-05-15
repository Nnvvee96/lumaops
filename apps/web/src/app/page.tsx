// S2E AppShell wraps every route via layout.tsx. This is the bare
// landing target for "/", which redirects to /overview in S2F.
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
        S2E — shell scaffold
      </p>
      <h1 className="mt-3 font-light tracking-tight text-4xl">
        Five signals. <span className="font-serif italic">One</span> room.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-mid">
        AppShell with sidebar nav + topbar lives in every route. Placeholder
        routes land in S2F; real data starts flowing in Phase 3.
      </p>
      <div className="mt-6">
        <Link
          href={"/overview" as never}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid hover:text-ink"
        >
          → /overview
        </Link>
      </div>
    </section>
  );
}
