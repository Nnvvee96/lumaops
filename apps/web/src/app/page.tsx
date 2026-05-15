// S2D scaffold. AppShell with sidebar/topbar lands in S2E,
// placeholder routes in S2F.
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-8">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
          LumaOps cockpit — shell scaffold
        </p>
        <h1 className="mt-3 font-light tracking-tight text-4xl">
          Five signals. <span className="font-serif italic">One</span> room.
        </h1>
        <p className="mt-4 text-sm text-ink-mid">
          AppShell, sidebar nav, and placeholder routes land in S2E – S2F.
        </p>
      </div>
    </main>
  );
}
