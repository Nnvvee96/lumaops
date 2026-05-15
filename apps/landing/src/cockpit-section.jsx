/* THE COCKPIT — the single dark full-bleed moment.
   Shows a believable LumaOps dashboard with NOESIS data. */

function CockpitSection() {
  return (
    <section id="cockpit" className="dark" style={{ position: "relative", overflow: "hidden" }}>

      {/* Soft luminous wash from above */}
      <div aria-hidden="true" style={{
        position: "absolute",
        left: "20%", top: "-10%",
        width: "60%", height: "60%",
        background: "radial-gradient(ellipse at center, color-mix(in oklch, var(--lumi-dk) 22%, transparent) 0%, transparent 60%)",
        filter: "blur(60px)",
        opacity: 0.5,
        pointerEvents: "none",
      }} />

      {/* ambient drifting beacons */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: 0.35,
      }}>
        <CockpitBeacons />
      </div>

      <div className="wrap" style={{ position: "relative", padding: "112px 32px" }}>

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span style={{ color: "var(--ink-text-low)" }}>005</span>
          <span style={{ color: "var(--ink-text-low)" }}>The cockpit</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
          gap: 80, alignItems: "end",
          marginBottom: 72,
        }} className="hero-grid">
          <h2 style={{ color: "var(--ink-paper)" }} className="vreveal">
            <WordReveal words={["Five", "feeds", "in."]} />
            <br/>
            <span className="serif" style={{ color: "var(--lumi-dk)", marginRight: "0.25em" }}>
              <WordReveal words={["One"]} startDelay={400} />
            </span>
            <WordReveal words={["rhythm", "out."]} startDelay={550} />
          </h2>
          <p className="lede vreveal" style={{ color: "var(--ink-text-mid)" }}>
            Sidebar, topbar, metrics, charts, tables, freshness, source. The first screen
            is the work, not a marketing pitch. LumaOps is dense by design — every pixel
            reports a fact, every signal carries its source.
          </p>
        </div>

        {/* full dashboard mock with boot sequence + scan beam */}
        <BootDashboard />

      </div>
    </section>
  );
}

/* Word-by-word reveal for headline. */
function WordReveal({ words, startDelay = 0 }) {
  const [ref, seen] = useInView();
  return (
    <span ref={ref} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: seen ? 1 : 0,
          transform: seen ? "translateY(0)" : "translateY(0.25em)",
          transition: `opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${startDelay + i * 120}ms, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${startDelay + i * 120}ms`,
        }}>
          {w}{i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/* Dashboard with boot-sequence reveal + scan beam. */
function BootDashboard() {
  const [ref, seen] = useInView({ threshold: 0.15 });
  const [booted, setBooted] = React.useState(false);
  React.useEffect(() => {
    if (seen && !booted) {
      const t = setTimeout(() => setBooted(true), 100);
      return () => clearTimeout(t);
    }
  }, [seen]);
  return (
    <div ref={ref} className="corners" style={{ position: "relative", marginTop: 16 }}>
      <span className="ct l"></span><span className="ct r"></span>
      <span className="cb l"></span><span className="cb r"></span>
      <DashboardMock booted={booted} />

      {/* Scan beam — sweeps once when first booted */}
      {booted && (
        <div aria-hidden="true" style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: "-10%", width: "20%",
          background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--growth-dk) 18%, transparent), transparent)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          animation: "scan-sweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.4s 1 forwards",
        }} />
      )}
      <style>{`
        @keyframes scan-sweep {
          0%   { left: -10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* Ambient slowly-drifting beacons in the cockpit backdrop. */
function CockpitBeacons() {
  const beacons = [
    { x: 6,  y: 24, delay: 0,    color: "var(--growth-dk)" },
    { x: 94, y: 18, delay: 1.5,  color: "var(--release-dk)" },
    { x: 12, y: 80, delay: 2.8,  color: "var(--revenue-dk)" },
    { x: 90, y: 76, delay: 0.7,  color: "var(--growth-dk)" },
  ];
  return (
    <svg style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
    }} aria-hidden="true">
      {beacons.map((b, i) => (
        <g key={i} transform={`translate(${b.x}%, ${b.y}%)`}>
          <circle r="2.5" fill={b.color}>
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="4s" begin={`${b.delay}s`} repeatCount="indefinite" />
          </circle>
          <circle r="2.5" fill="none" stroke={b.color} strokeWidth="0.7" strokeOpacity="0.4">
            <animate attributeName="r" values="2.5;36;2.5" dur="4s" begin={`${b.delay}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="4s" begin={`${b.delay}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ---------- The mock ---------- */
function DashboardMock({ booted = true }) {
  const bs = (delay) => ({
    opacity: booted ? 1 : 0,
    transform: booted ? "translateY(0)" : "translateY(6px)",
    transition: `opacity 600ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
  });
  return (
    <div style={{
      background: "var(--ink-bg-1)",
      border: "1px solid var(--ink-line)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 60px 120px -50px rgba(0,0,0,0.6)",
      display: "grid",
      gridTemplateColumns: "220px 1fr",
      gridTemplateRows: "auto 1fr",
      position: "relative",
    }}>

      {/* Sidebar */}
      <aside style={{
        gridRow: "1 / -1",
        background: "var(--ink-bg)",
        borderRight: "1px solid var(--ink-line)",
        padding: "16px 12px",
        display: "flex", flexDirection: "column", gap: 14,
        ...bs(0),
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 12px",
          borderBottom: "1px solid var(--ink-line)",
        }}>
          <LumaMark size={22} color="var(--ink-paper)" accent="var(--lumi-dk)" pulse />
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>LumaOps</span>
        </div>

        <SidebarSection label="Workspace">
          <SidebarRow icon="cube" label="Overview" active />
          <SidebarRow icon="layers" label="Products" badge="2" />
          <SidebarRow icon="funnel" label="Funnels" />
          <SidebarRow icon="card" label="Revenue" />
          <SidebarRow icon="cube" label="Releases" />
          <SidebarRow icon="inbox" label="Support" badge="3" badgeTone="support" />
          <SidebarRow icon="signal" label="Telemetry" />
        </SidebarSection>

        <SidebarSection label="Products">
          <SidebarRow icon="dot" iconColor="var(--growth-dk)" label="NOESIS.Tools" sub="beta" active />
          <SidebarRow icon="dot" iconColor="var(--ink-text-low)" label="+ Add product" muted />
        </SidebarSection>

        <SidebarSection label="System">
          <SidebarRow icon="shield" label="Integrations" badge="2" badgeTone="revenue" />
          <SidebarRow icon="terminal" label="Settings" muted />
        </SidebarSection>
      </aside>

      {/* Topbar */}
      <header style={{
        gridColumn: "2",
        padding: "12px 20px",
        borderBottom: "1px solid var(--ink-line)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--ink-bg-1)",
        ...bs(150),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Breadcrumb crumbs={["NOESIS.Tools", "Overview"]} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Segmented options={["24h", "7d", "30d", "90d"]} active="7d" />
          <Segmented options={["beta", "public"]} active="beta" />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 10px",
            border: "1px solid var(--ink-line-2)",
            borderRadius: 6,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--growth-dk)",
            letterSpacing: "0.04em",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--growth-dk)",
              animation: "pulse 2.4s ease-in-out infinite",
            }} />
            SYNCED · 14:32
          </span>
        </div>
      </header>

      {/* Main body */}
      <main style={{
        gridColumn: "2",
        padding: 20,
        display: "flex", flexDirection: "column", gap: 16,
        background: "var(--ink-bg)",
        ...bs(300),
      }}>

        {/* metric grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--ink-line)",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--ink-line)",
        }}>
          <MetricCell dark label="Website visits"   value={12418} delta="18.2%" deltaTone="up" />
          <MetricCell dark label="Beta leads"        value={486}   delta="22.7%" deltaTone="up" />
          <MetricCell dark label="Download starts"   value={142}   delta="8.4%"  deltaTone="up" />
          <MetricCell dark label="Open tickets"      value={3}     delta="1 new" deltaTone="down" />
        </div>

        {/* chart row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          gap: 12,
        }}>
          {/* Funnel */}
          <Panel dark title="Beta funnel" meta="visit → download · 7d" accent="var(--growth-dk)">
            <div style={{ padding: 18 }}>
              <FunnelRow dark label="visit"        value={12418} pct={100}  color="var(--growth-dk)" delay={0} />
              <FunnelRow dark label="dl section"   value={8941}  pct={72}   color="var(--growth-dk)" delay={80} />
              <FunnelRow dark label="email sent"   value={486}   pct={3.9}  color="var(--growth-dk)" delay={160} />
              <FunnelRow dark label="link opened"  value={298}   pct={2.4}  color="var(--release-dk)" delay={240} />
              <FunnelRow dark label="download"     value={142}   pct={1.14} color="var(--revenue-dk)" delay={320} />
            </div>
          </Panel>

          {/* Leads over time */}
          <Panel dark title="Leads · daily" meta="last 7d">
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span className="tnum" style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.025em", color: "var(--ink-paper)" }}>
                  <CountUp to={486} />
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--growth-dk)" }}>
                  ▲ 22.7%
                </span>
              </div>
              <Sparkline points={[42, 58, 51, 64, 72, 89, 110]} color="var(--growth-dk)" height={68} area />
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-text-low)",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* secondary row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Release */}
          <Panel dark title="Current release" meta="GitHub" accent="var(--release-dk)">
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--release-dk)" }}>v0.4.2</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-text-low)" }}>published 2d ago</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { l: "macOS Apple Silicon", ok: true },
                  { l: "macOS Intel",         ok: false },
                  { l: "Windows x64",         ok: false },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "5px 0",
                    fontFamily: "var(--font-mono)", fontSize: 11.5,
                    color: "var(--ink-text-mid)",
                    borderTop: i === 0 ? "none" : "1px solid var(--ink-line)",
                  }}>
                    <span>{r.l}</span>
                    <span style={{ color: r.ok ? "var(--growth-dk)" : "var(--ink-text-low)" }}>
                      {r.ok ? "✓ available" : "○ planned"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Support */}
          <Panel dark title="Support pressure" meta="GitHub Issues" accent="var(--support-dk)">
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span className="tnum" style={{ fontSize: 26, color: "var(--ink-paper)" }}>3</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--support-dk)" }}>1 new today</span>
              </div>
              <Bars values={[1, 0, 2, 1, 0, 1, 3]} height={36} color="var(--support-dk)" lastColor="var(--support-dk)" />
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-text-low)",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                <span>Mon</span><span>Sun</span>
              </div>
            </div>
          </Panel>

          {/* Integrations */}
          <Panel dark title="Integrations" meta="3 / 5 connected">
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: "GitHub",     s: "live"    },
                { l: "Cloudflare", s: "live"    },
                { l: "Tracking",   s: "live"    },
                { l: "Stripe",     s: "pending" },
                { l: "Telemetry",  s: "planned" },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "4px 0",
                  fontFamily: "var(--font-mono)", fontSize: 11.5,
                  color: "var(--ink-text-mid)",
                  borderTop: i === 0 ? "none" : "1px solid var(--ink-line)",
                }}>
                  <span>{r.l}</span>
                  <StatusBadge dark status={r.s} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

      </main>
    </div>
  );
}

/* ---------- Sidebar atoms ---------- */
function SidebarSection({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: "var(--ink-text-low)",
        padding: "8px 10px 4px",
      }}>{label}</div>
      {children}
    </div>
  );
}

function SidebarRow({ icon, iconColor, label, sub, active, badge, badgeTone, muted }) {
  const badgeColor = badgeTone === "support" ? "var(--support-dk)" : badgeTone === "revenue" ? "var(--revenue-dk)" : "var(--ink-text-low)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 10px", borderRadius: 6,
      background: active ? "color-mix(in oklch, var(--ink-paper) 6%, transparent)" : "transparent",
      color: muted ? "var(--ink-text-low)" : active ? "var(--ink-paper)" : "var(--ink-text-mid)",
      fontSize: 13, letterSpacing: "-0.005em",
      cursor: "default",
    }}>
      <span style={{ width: 14, display: "grid", placeItems: "center", color: iconColor || "currentColor" }}>
        <Icon name={icon} size={icon === "dot" ? 8 : 14} fill={icon === "dot" ? "currentColor" : "none"} stroke={icon === "dot" ? "currentColor" : "currentColor"} />
      </span>
      <span style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 6 }}>
        {label}
        {sub && <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--ink-text-low)",
        }}>{sub}</span>}
      </span>
      {badge && <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        padding: "1px 6px", borderRadius: 999,
        background: "color-mix(in oklch, var(--ink-paper) 8%, transparent)",
        color: badgeColor,
      }}>{badge}</span>}
    </div>
  );
}

function Breadcrumb({ crumbs }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "var(--font-mono)", fontSize: 12,
      color: "var(--ink-text-mid)",
    }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <span style={{ color: i === crumbs.length - 1 ? "var(--ink-paper)" : "var(--ink-text-mid)" }}>{c}</span>
          {i < crumbs.length - 1 && <span style={{ color: "var(--ink-text-low)" }}>/</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Segmented({ options, active }) {
  return (
    <div style={{
      display: "inline-flex",
      border: "1px solid var(--ink-line-2)",
      borderRadius: 6,
      overflow: "hidden",
      fontFamily: "var(--font-mono)", fontSize: 11,
      letterSpacing: "0.04em",
    }}>
      {options.map((o, i) => (
        <span key={o} style={{
          padding: "6px 10px",
          background: o === active ? "color-mix(in oklch, var(--ink-paper) 8%, transparent)" : "transparent",
          color: o === active ? "var(--ink-paper)" : "var(--ink-text-mid)",
          borderLeft: i > 0 ? "1px solid var(--ink-line-2)" : "none",
        }}>{o}</span>
      ))}
    </div>
  );
}

window.CockpitSection = CockpitSection;
