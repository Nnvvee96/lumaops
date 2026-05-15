/* Nav + Hero — editorial frame, one proof moment. */

const { useEffect: useEffectH, useState: useStateH } = React;

/* ---------- NAV ---------- */
function Nav() {
  const [scrolled, setScrolled] = useStateH(false);
  useEffectH(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      padding: scrolled ? "12px 0" : "20px 0",
      transition: "padding 220ms ease, background 220ms ease, border-color 220ms ease",
      background: scrolled ? "color-mix(in oklch, var(--paper) 86%, transparent)" : "transparent",
      backdropFilter: scrolled ? "saturate(140%) blur(14px)" : "none",
      WebkitBackdropFilter: scrolled ? "saturate(140%) blur(14px)" : "none",
      borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <a href="#top" style={{ textDecoration: "none" }}>
          <Wordmark />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <ul style={{
            display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0,
            fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            <li><a href="#concept" style={{ color: "var(--ink-mid)", textDecoration: "none" }}>Concept</a></li>
            <li><a href="#cockpit" style={{ color: "var(--ink-mid)", textDecoration: "none" }}>Cockpit</a></li>
            <li><a href="#connectors" style={{ color: "var(--ink-mid)", textDecoration: "none" }}>Connectors</a></li>
            <li><a href="#roadmap" style={{ color: "var(--ink-mid)", textDecoration: "none" }}>Roadmap</a></li>
          </ul>
          <a className="btn btn-ghost" href="https://github.com" style={{ height: 36, padding: "0 14px", fontSize: 12.5 }}>
            <Icon name="github" size={14} /> GitHub
          </a>
          <ThemeToggle />
          <a className="btn btn-primary" href="#get-started" style={{ height: 36, padding: "0 16px", fontSize: 12.5 }}>
            Clone &amp; run <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section id="top" style={{ position: "relative", padding: "16px 0 56px" }}>

      {/* Background: ambient pulsing beacons only — no grid */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <HeroBeacons />
        <div style={{
          position: "absolute",
          left: "15%", top: "20%",
          width: "55%", height: "70%",
          background: "radial-gradient(ellipse at center, color-mix(in oklch, var(--lumi) 22%, transparent) 0%, transparent 60%)",
          filter: "blur(60px)",
          opacity: 0.45,
        }} />
      </div>

      <div className="wrap" style={{ position: "relative" }}>

        {/* eyebrow row — compact, single pill + coordinate ticker */}
        <div className="reveal revealed" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 16, marginBottom: 64, animationDelay: "0ms",
          flexWrap: "wrap", gap: 16,
        }}>
          <div className="pill live">
            <span className="dot"></span>
            v0.1 — beta · open source · self-hostable
          </div>
          <div className="micro" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            letterSpacing: "0.14em", color: "var(--ink-low)",
          }}>
            <span>BUILD 0142</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-dim)" }} />
            <span>WORKSPACE · LOCAL</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-dim)" }} />
            <span style={{ color: "var(--lumi-deep)" }}>● READY</span>
          </div>
        </div>

        {/* Centered massive headline — tightened above and below */}
        <div className="reveal revealed" style={{
          animationDelay: "60ms",
          textAlign: "center",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <h1 style={{ letterSpacing: "-0.045em" }}>
            <span style={{ display: "block" }}>Five signals.</span>
            <span style={{ display: "block" }}>
              <span className="serif" style={{ fontSize: "1.05em", color: "var(--lumi-deep)" }}>One</span>{" "}
              <span className="lumi-mark-inline">
                <SignalConvergence />
              </span>{" "}
              room.
            </span>
          </h1>

          {/* Category line — the punchline that says what LumaOps IS, in 1 second */}
          <div className="reveal revealed hero-cat-pill" style={{
            animationDelay: "180ms",
            marginTop: 28,
            display: "inline-flex", alignItems: "center", gap: 14,
            padding: "8px 18px",
            border: "1px solid var(--line)",
            borderRadius: 999,
            background: "color-mix(in oklch, var(--paper-1) 60%, transparent)",
            fontFamily: "var(--font-mono)", fontSize: 12.5,
            letterSpacing: "0.04em",
            color: "var(--ink-mid)",
          }}>
            <span style={{ color: "var(--lumi-deep)" }}>The operations cockpit</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-dim)" }} />
            <span>for indie founders</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-dim)" }} />
            <span>open source, self-hosted</span>
          </div>

          <p className="lede reveal revealed" style={{
            animationDelay: "300ms",
            marginTop: 28, marginInline: "auto", maxWidth: 580,
            fontSize: 18.5, lineHeight: 1.45,
          }}>
            Connect your stack. See every product alive. <strong style={{ color: "var(--ink)", fontWeight: 500 }}>What's shipping, converting, earning, breaking, growing</strong> — across every product you launch.
          </p>

          <div className="reveal revealed" style={{
            animationDelay: "440ms",
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 32,
          }}>
            <a className="btn btn-primary" href="#get-started">
              Clone &amp; run <span className="arrow">→</span>
            </a>
            <a className="btn btn-ghost" href="#cockpit">
              See the cockpit <span className="arrow">↓</span>
            </a>
          </div>
        </div>

        {/* Below headline: hero proof bar — tighter spacing */}
        <div className="reveal revealed corners" style={{
          animationDelay: "480ms",
          position: "relative",
          maxWidth: 1080, margin: "64px auto 0",
        }}>
          <span className="ct l"></span><span className="ct r"></span>
          <span className="cb l"></span><span className="cb r"></span>
          <HeroProofBar />
        </div>

      </div>
    </section>
  );
}

/* Inline convergence mark — five flowing lines into one point, lives inside the headline. */
function SignalConvergence() {
  return (
    <span style={{
      display: "inline-block",
      verticalAlign: "middle",
      transform: "translateY(-0.04em)",
      width: "0.95em", height: "0.95em",
    }}>
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id="lumi-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--lumi)" stopOpacity="0.65" />
            <stop offset="60%" stopColor="var(--lumi)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--lumi)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Halo */}
        <circle cx="32" cy="32" r="18" fill="url(#lumi-glow)" />
        {/* Five converging lines */}
        <g stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <line x1="32" y1="6"  x2="32" y2="20">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" begin="0s" repeatCount="indefinite" />
          </line>
          <line x1="56" y1="20" x2="42" y2="28">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" begin="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="56" y1="44" x2="42" y2="36">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" begin="0.8s" repeatCount="indefinite" />
          </line>
          <line x1="8"  y1="44" x2="22" y2="36">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" begin="1.2s" repeatCount="indefinite" />
          </line>
          <line x1="8"  y1="20" x2="22" y2="28">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" begin="1.6s" repeatCount="indefinite" />
          </line>
        </g>
        {/* Center node — luminous */}
        <circle cx="32" cy="32" r="6" fill="var(--lumi)" />
        <circle cx="32" cy="32" r="6" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="1.6" fill="white" opacity="0.7" />
      </svg>
    </span>
  );
}

/* Compact horizontal proof bar — replaces the awkward dark card.
   Shows the FIVE signals as live data, with the LumaOps lumi anchoring the "live" indicator. */
function HeroProofBar() {
  return (
    <div style={{
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      boxShadow: "0 30px 80px -50px rgba(20,15,5,0.18)",
    }} className="hero-proof">

      {/* Label rail */}
      <div style={{
        background: "var(--ink-bg)",
        color: "var(--ink-paper)",
        padding: "20px 22px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        gap: 12,
        minWidth: 200,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LumaMark size={24} color="var(--ink-paper)" accent="var(--lumi-dk)" pulse />
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>NOESIS.Tools</span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--ink-text-low)",
        }}>
          beta · live in cockpit
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--lumi-dk)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--lumi-dk)",
            boxShadow: "0 0 0 3px color-mix(in oklch, var(--lumi-dk) 22%, transparent)",
            animation: "pulse 2.4s ease-in-out infinite",
          }} />
          synced 14:32
        </div>
      </div>

      {/* Five signal cells */}
      <div className="hero-proof-cells" style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 1, background: "var(--line)",
      }}>
        <HeroSignalCell label="shipped"   value="v0.4.2"  delta="2d ago"    tone="release" />
        <HeroSignalCell label="converted" value={486}     delta="+22.7%"   tone="lumi" sparkline={[40, 58, 51, 64, 72, 89, 110]} />
        <HeroSignalCell label="earned"    value="—"       delta="pending"  tone="muted" />
        <HeroSignalCell label="broke"     value={3}       delta="1 new"    tone="support" />
        <HeroSignalCell label="growing"   value={142}     delta="+8.4%"    tone="lumi" sparkline={[12, 18, 22, 28, 36, 44, 58]} />
      </div>
    </div>
  );
}

function HeroSignalCell({ label, value, delta, tone, sparkline }) {
  const toneMap = {
    lumi:    "var(--lumi-deep)",
    release: "var(--release)",
    revenue: "var(--revenue)",
    support: "var(--support)",
    muted:   "var(--ink-low)",
  };
  const col = toneMap[tone];
  return (
    <div style={{
      background: "var(--paper)",
      padding: "16px 16px 14px",
      display: "flex", flexDirection: "column", gap: 6,
      minHeight: 110,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-low)",
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em",
        color: tone === "muted" ? "var(--ink-low)" : "var(--ink)",
      }} className="tnum">
        {typeof value === "number" ? <CountUp to={value} /> : value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        color: col, letterSpacing: "0.02em",
      }}>{delta}</div>
      {sparkline && (
        <div style={{ marginTop: 2, height: 16 }}>
          <Sparkline points={sparkline} color={col} height={16} strokeWidth={1.2} area={false} />
        </div>
      )}
    </div>
  );
}

window.Nav = Nav;
window.Hero = Hero;
window.HeroProofBar = HeroProofBar;
window.SignalConvergence = SignalConvergence;

/* ---------- THEME TOGGLE ---------- */
function ThemeToggle() {
  const [theme, setTheme] = useStateH(() => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lumaops-theme', next); } catch (e) {}
  };
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: 36, height: 36,
        borderRadius: "50%",
        border: "1px solid var(--line-2)",
        background: "color-mix(in oklch, var(--paper-1) 50%, transparent)",
        cursor: "pointer",
        display: "grid", placeItems: "center",
        color: "var(--ink)",
        transition: "all 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
        e.currentTarget.style.color = "var(--lumi)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line-2)";
        e.currentTarget.style.color = "var(--ink)";
      }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} strokeWidth={1.6} />
    </button>
  );
}

window.ThemeToggle = ThemeToggle;

/* ---------- HERO BEACONS ---------- */
/* Three subtle pulsing beacons scattered behind the hero, each pulsing
   on a different rhythm. Reads as ambient "signals being collected". */
function HeroBeacons() {
  // Positions in percentages of the viewport area
  const beacons = [
    { x: 8,  y: 22, delay: 0,    color: "var(--release)" },
    { x: 92, y: 14, delay: 1.3,  color: "var(--lumi)" },
    { x: 14, y: 78, delay: 2.6,  color: "var(--revenue)" },
    { x: 88, y: 72, delay: 0.8,  color: "var(--lumi)" },
    { x: 50, y: 6,  delay: 1.9,  color: "var(--ink-low)" },
    { x: 50, y: 92, delay: 0.4,  color: "var(--release)" },
  ];
  return (
    <svg style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none",
      opacity: 0.55,
    }} aria-hidden="true">
      {beacons.map((b, i) => (
        <g key={i} transform={`translate(${b.x}%, ${b.y}%)`}>
          <circle r="3" fill={b.color}>
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="3.6s" begin={`${b.delay}s`} repeatCount="indefinite" />
          </circle>
          <circle r="3" fill="none" stroke={b.color} strokeWidth="0.8" strokeOpacity="0.5">
            <animate attributeName="r" values="3;28;3" dur="3.6s" begin={`${b.delay}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.45;0;0.45" dur="3.6s" begin={`${b.delay}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

window.HeroBeacons = HeroBeacons;
