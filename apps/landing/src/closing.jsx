/* Closing sections — principles, terminal, roadmap, final CTA, footer. */

/* =================================================================
   06 PRINCIPLES — open source, self-hosted, honest
   ================================================================= */
function Principles() {
  const items = [
    {
      title: "Open source, by default.",
      desc: "MIT-licensed. The full operations layer in your repo, your control, your audit.",
      tag: "MIT",
    },
    {
      title: "Self-hostable, first.",
      desc: "Run it on your laptop, on a Cloudflare tunnel, in a homelab — wherever your data lives.",
      tag: "LOCAL",
    },
    {
      title: "Bring your own tokens.",
      desc: "Every connector authenticates against your own accounts. No LumaOps server holds your secrets.",
      tag: "BYO",
    },
    {
      title: "Honest data, always.",
      desc: "Stale is labelled stale. Inferred is labelled inferred. Missing integrations don't fake numbers.",
      tag: "TRUTH",
    },
    {
      title: "Multi-product, first-class.",
      desc: "Every product is a real object — compare them, switch between them, run them in parallel.",
      tag: "MULTI",
    },
    {
      title: "Dense, not loud.",
      desc: "A real cockpit, not a marketing dashboard. Every pixel reports a fact. No filler, no noise.",
      tag: "DENSE",
    },
  ];
  return (
    <section className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span>008</span><span>Principles</span>
        </div>

        <div style={{ marginBottom: 72 }} className="hero-grid principles-head">
          <h2 className="vreveal" style={{ maxWidth: 700 }}>
            A tool that<br/>
            <span className="serif" style={{ color: "var(--lumi-deep)" }}>respects</span> the operator.
          </h2>
        </div>

        <div className="principles-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {items.map((it, i) => (
            <div key={i} className="vreveal" style={{
              background: "var(--paper)",
              padding: "32px 28px",
              display: "flex", flexDirection: "column", gap: 12,
              minHeight: 200,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "var(--ink-low)",
                marginBottom: 4,
              }}>0{i + 1} · {it.tag}</span>
              <h3 style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.2 }}>
                {it.title}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-mid)" }}>
                {it.desc}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 880px) { .principles-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px) { .principles-grid { grid-template-columns: 1fr !important; } }
        `}</style>

      </div>
    </section>
  );
}

/* =================================================================
   07 TERMINAL — get started
   ================================================================= */
function Terminal() {
  return (
    <section id="get-started" className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span>009</span><span>Get started</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          gap: 80, alignItems: "start",
        }} className="hero-grid">

          <div>
            <h2 className="vreveal">
              Three commands.<br/>
              <span className="serif" style={{ color: "var(--lumi-deep)" }}>One</span> cockpit.
            </h2>
            <p className="lede vreveal" style={{ marginTop: 28, maxWidth: 460 }}>
              Clone the repo, install dependencies, point at your accounts.
              The first screen is the dashboard — not a setup wizard.
            </p>

            <div className="vreveal" style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { n: "01", l: "Clone the repo from GitHub" },
                { n: "02", l: "Install deps with pnpm" },
                { n: "03", l: "Set credentials in .env" },
                { n: "04", l: "Open the cockpit on :3000" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "44px 1fr",
                  gap: 16, alignItems: "baseline",
                }}>
                  <span className="micro" style={{ color: "var(--ink-low)" }}>{s.n}</span>
                  <span style={{ fontSize: 15.5, color: "var(--ink)" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal window */}
          <div className="vreveal corners" style={{ position: "relative" }}>
            <span className="ct l"></span><span className="ct r"></span>
            <span className="cb l"></span><span className="cb r"></span>

            <div style={{
              background: "var(--ink-bg)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              border: "1px solid var(--ink-line)",
              boxShadow: "0 30px 80px -40px rgba(20,15,5,0.35)",
            }}>
              {/* Window chrome */}
              <div style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--ink-line)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#3a382f" }} />
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#3a382f" }} />
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#3a382f" }} />
                </div>
                <span style={{
                  flex: 1, textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--ink-text-low)", letterSpacing: "0.08em",
                }}>~/lumaops</span>
              </div>

              {/* Body */}
              <div style={{
                padding: "20px 22px 22px",
                fontFamily: "var(--font-mono)", fontSize: 13,
                lineHeight: 1.7,
                color: "var(--ink-text-mid)",
              }}>
                <TerminalLine prompt cmd="git clone https://github.com/lumaops/lumaops.git" />
                <div style={{ color: "var(--ink-text-low)", fontSize: 12, paddingLeft: 16 }}>
                  Cloning into 'lumaops' ... done.
                </div>
                <TerminalLine prompt cmd="cd lumaops &amp;&amp; pnpm install" />
                <div style={{ color: "var(--ink-text-low)", fontSize: 12, paddingLeft: 16 }}>
                  ✓ resolved 412 dependencies in 4.1s
                </div>
                <TerminalLine prompt cmd="cp .env.example .env  # add your tokens" />
                <TerminalLine prompt cmd="pnpm dev" />
                <div style={{ color: "var(--growth-dk)", fontSize: 12, paddingLeft: 16 }}>
                  ▲ ready on http://localhost:3000
                </div>
                <div style={{ color: "var(--ink-text-low)", fontSize: 12, paddingLeft: 16 }}>
                  ◦ connectors: github, cloudflare
                </div>
                <div style={{
                  marginTop: 14, paddingTop: 12,
                  borderTop: "1px solid var(--ink-line)",
                  fontSize: 12, color: "var(--ink-text-low)",
                  display: "flex", justifyContent: "space-between",
                }}>
                  <span>NOESIS.Tools · 1 product · synced</span>
                  <span style={{ color: "var(--growth-dk)" }}>● ready<span className="caret"></span></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TerminalLine({ prompt, cmd }) {
  return (
    <div style={{ display: "flex", gap: 10, color: "var(--ink-paper)" }}>
      {prompt && <span style={{ color: "var(--growth-dk)" }}>$</span>}
      <span dangerouslySetInnerHTML={{ __html: cmd }} />
    </div>
  );
}

/* =================================================================
   08 ROADMAP — horizontal track with station markers
   ================================================================= */
function Roadmap() {
  const phases = [
    { n: 1, title: "Internal Control Room",   state: "shipping",
      bullets: ["Single workspace", "First product wired", "Dashboard shell", "Event schema"] },
    { n: 2, title: "Multi-product Internal",  state: "next",
      bullets: ["Cross-product overview", "Per-product detail", "Shared integrations", "Health comparison"] },
    { n: 3, title: "Connector Framework",     state: "planned",
      bullets: ["GitHub · Cloudflare", "Stripe · Tracking", "App telemetry", "Open API spec"] },
    { n: 4, title: "External Founder Product", state: "planned",
      bullets: ["Onboarding", "Workspaces", "OAuth marketplace", "Public launch reports"] },
    { n: 5, title: "Intelligence Layer",      state: "horizon",
      bullets: ["Health score", "Launch readiness", "Drop-off diagnosis", "“What changed?”"] },
  ];
  return (
    <section id="roadmap" className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span>010</span><span>Roadmap</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: 80, alignItems: "end", marginBottom: 80,
        }} className="hero-grid">
          <h2 className="vreveal">
            Five phases.<br/>
            <span className="serif" style={{ color: "var(--lumi-deep)" }}>One</span> step at a time.
          </h2>
          <p className="lede vreveal">
            LumaOps grows from internal cockpit → multi-product overview → real
            connector framework → external operator product → intelligence layer.
            Each phase has to be useful before the next one starts.
          </p>
        </div>

        <RoadmapTrack phases={phases} />

      </div>
    </section>
  );
}

/* ---------- The horizontal track ---------- */
function RoadmapTrack({ phases }) {
  const [trackRef, seen] = useInView({ threshold: 0.2 });
  return (
    <div ref={trackRef} className="roadmap-track" style={{ position: "relative" }}>

      {/* The track line + progress fill */}
      <div style={{ position: "relative", height: 1, marginBottom: 32 }}>
        <div style={{
          position: "absolute", left: 0, right: 0, top: 0, height: 1,
          background: "var(--line-2)",
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, height: 1,
          width: "30%",  /* phase 1 shipping, edging into phase 2 */
          background: "linear-gradient(to right, var(--growth) 0%, var(--revenue) 100%)",
          transformOrigin: "left",
          transform: seen ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) 200ms",
        }} />

        {/* station markers on the track */}
        {phases.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i / (phases.length - 1)) * 100}%`,
            top: 0, transform: "translate(-50%, -50%)",
          }}>
            <StationMarker state={p.state} index={i} seen={seen} />
          </div>
        ))}
      </div>

      {/* phases content row */}
      <div className="roadmap-grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${phases.length}, 1fr)`,
        gap: 24,
      }}>
        {phases.map((p, i) => (
          <RoadmapPhase key={i} phase={p} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 880px) {
          .roadmap-track > div:first-child { display: none; }
          .roadmap-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StationMarker({ state, index, seen }) {
  const map = {
    shipping: { color: "var(--growth)",  pulse: true,  ring: true,  size: 14 },
    next:     { color: "var(--revenue)", pulse: false, ring: true,  size: 12 },
    planned:  { color: "var(--ink-low)", pulse: false, ring: false, size: 10 },
    horizon:  { color: "var(--ink-dim)", pulse: false, ring: false, size: 8 },
  };
  const s = map[state] || map.planned;
  const delay = 200 + index * 120;
  return (
    <div style={{
      width: s.size, height: s.size, borderRadius: "50%",
      background: s.color,
      boxShadow: s.ring ? `0 0 0 4px var(--paper), 0 0 0 5px ${s.color}` : `0 0 0 4px var(--paper)`,
      opacity: seen ? 1 : 0,
      transform: seen ? "scale(1)" : "scale(0)",
      transition: `opacity 400ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
      animation: s.pulse ? "pulse 2.4s ease-in-out infinite" : "none",
      position: "relative",
    }} />
  );
}

function RoadmapPhase({ phase, index }) {
  const stateMap = {
    shipping: { label: "shipping now",   color: "var(--growth)",   intensity: 1.0 },
    next:     { label: "up next",         color: "var(--revenue)",  intensity: 0.85 },
    planned:  { label: "planned",         color: "var(--ink-low)",  intensity: 0.65 },
    horizon:  { label: "on the horizon",  color: "var(--ink-low)",  intensity: 0.55 },
  };
  const s = stateMap[phase.state];
  return (
    <div className="vreveal" style={{
      paddingTop: 12,
      display: "flex", flexDirection: "column", gap: 12,
      opacity: s.intensity,
      transition: "opacity 240ms ease",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--ink-low)",
        }}>Phase 0{phase.n}</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: s.color,
        }}>
          {s.label}
        </span>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>
        {phase.title}
      </h3>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {phase.bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-mid)", letterSpacing: "0.02em",
            display: "flex", gap: 6, alignItems: "baseline", lineHeight: 1.5,
          }}>
            <span style={{ color: "var(--ink-low)" }}>—</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =================================================================
   09 FINAL CTA — compact, dense, no orphan whitespace
   ================================================================= */
function FinalCTA() {
  return (
    <section className="section-pad" style={{ position: "relative" }}>
      <div className="wrap-narrow" style={{ position: "relative" }}>

        <div className="vreveal corners" style={{
          position: "relative",
          background: "var(--ink-bg)",
          color: "var(--ink-paper)",
          borderRadius: "var(--radius-xl)",
          padding: "56px 56px 52px",
          overflow: "hidden",
        }}>
          {/* Luminous wash */}
          <div aria-hidden="true" style={{
            position: "absolute",
            right: "-10%", top: "-30%",
            width: "60%", height: "120%",
            background: "radial-gradient(ellipse at center, color-mix(in oklch, var(--lumi-dk) 30%, transparent) 0%, transparent 60%)",
            filter: "blur(40px)",
            opacity: 0.45,
            pointerEvents: "none",
          }} />

          <span className="ct l"></span><span className="ct r"></span>
          <span className="cb l"></span><span className="cb r"></span>

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.9fr)", gap: 64, alignItems: "center" }} className="final-grid">

            <div>
              <div className="num-tag" style={{ marginBottom: 24, color: "var(--ink-text-low)" }}>
                <span style={{ color: "var(--ink-text-low)" }}>011</span>
                <span style={{ color: "var(--ink-text-low)" }}>Today</span>
                <span style={{ background: "var(--ink-line)", flex: "0 1 60px" }}></span>
              </div>
              <h1 style={{
                fontSize: "clamp(40px, 5.4vw, 76px)",
                fontWeight: 300, letterSpacing: "-0.038em", lineHeight: 1.0,
                color: "var(--ink-paper)",
              }}>
                Stop stitching.<br/>
                Start <span className="serif" style={{ color: "var(--lumi-dk)" }}>operating</span>.
              </h1>
              <p style={{
                marginTop: 24, maxWidth: 460,
                fontSize: 17, lineHeight: 1.5,
                color: "var(--ink-text-mid)",
              }}>
                Open source from day one. One command, your data, your accounts.
                No waitlist, no signup, no LumaOps server in between.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
                <a className="btn" href="https://github.com" style={{
                  background: "var(--lumi-dk)", color: "var(--ink-bg)",
                  borderColor: "var(--lumi-dk)",
                }}>
                  <Icon name="github" size={14} /> Clone the repo <span className="arrow">→</span>
                </a>
                <a className="btn" href="#concept" style={{
                  background: "transparent", color: "var(--ink-paper)",
                  borderColor: "var(--ink-line-2)",
                }}>
                  Read the concept <span className="arrow">↗</span>
                </a>
              </div>
            </div>

            {/* Right: terminal-style command card */}
            <div style={{
              background: "rgba(0,0,0,0.32)",
              border: "1px solid var(--ink-line-2)",
              borderRadius: 10,
              padding: "18px 20px",
              fontFamily: "var(--font-mono)", fontSize: 13,
              lineHeight: 1.8,
              color: "var(--ink-text-mid)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingBottom: 12, marginBottom: 12,
                borderBottom: "1px solid var(--ink-line)",
                fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--ink-text-low)",
              }}>
                <span>~/lumaops</span>
                <span style={{ color: "var(--lumi-dk)" }}>● ready</span>
              </div>
              <div><span style={{ color: "var(--lumi-dk)" }}>$</span> <span style={{ color: "var(--ink-paper)" }}>git clone lumaops</span></div>
              <div><span style={{ color: "var(--lumi-dk)" }}>$</span> <span style={{ color: "var(--ink-paper)" }}>pnpm install &amp;&amp; pnpm dev</span></div>
              <div style={{ color: "var(--lumi-dk)" }}>▲ ready on :3000<span className="caret" style={{ background: "var(--lumi-dk)" }}></span></div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 880px) {
            .final-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          }
        `}</style>

      </div>
    </section>
  );
}

/* =================================================================
   10 FOOTER
   ================================================================= */
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--line)",
      padding: "56px 0 32px",
      marginTop: 40,
    }}>
      <div className="wrap" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) repeat(3, minmax(0, 1fr))",
        gap: 48,
        alignItems: "start",
      }} className="footer-grid">

        <div>
          <Wordmark />
          <p style={{ marginTop: 16, maxWidth: 320, fontSize: 14, color: "var(--ink-mid)" }}>
            The open-source operations cockpit for indie software products.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
            <a className="btn btn-ghost" href="https://github.com" style={{ height: 34, padding: "0 14px", fontSize: 12 }}>
              <Icon name="github" size={13} /> GitHub
            </a>
          </div>
        </div>

        <FooterCol title="Product" links={["Concept", "Cockpit", "Connectors", "Roadmap"]} />
        <FooterCol title="Open source" links={["Repository", "Releases", "License (MIT)", "Issues"]} />
        <FooterCol title="Resources" links={["Documentation", "Event schema", "Self-hosting guide", "Changelog"]} />

      </div>

      <div className="wrap" style={{
        marginTop: 56, paddingTop: 24,
        borderTop: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
        fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.08em", color: "var(--ink-low)",
      }}>
        <span>LUMAOPS · MIT · 2026</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
          <a href="https://navyug.me" target="_blank" rel="noopener" style={{
            color: "var(--ink-mid)",
            textDecoration: "none",
            transition: "color 160ms ease",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--ink)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-mid)"}
          >
            BUILT BY NAVYUG <span style={{ fontSize: 13 }}>↗</span>
          </a>
          <a href="https://x.com/nnvve9" target="_blank" rel="noopener" style={{
            color: "var(--ink-mid)",
            textDecoration: "none",
            transition: "color 160ms ease",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--ink)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-mid)"}
          >
            @NNVVE9 <span style={{ fontSize: 13 }}>↗</span>
          </a>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--lumi)",
              boxShadow: "0 0 0 3px color-mix(in oklch, var(--lumi) 30%, transparent)",
              animation: "pulse 2.4s ease-in-out infinite",
            }} />
            STATUS · OPERATIONAL
          </span>
        </span>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="micro" style={{ marginBottom: 18 }}>{title}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l, i) => (
          <li key={i}>
            <a href="#" style={{
              fontSize: 14, color: "var(--ink-mid)", textDecoration: "none",
              transition: "color 160ms ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--ink)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-mid)"}
            >{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

window.Principles = Principles;
window.Terminal = Terminal;
window.Roadmap = Roadmap;
window.FinalCTA = FinalCTA;
window.Footer = Footer;
