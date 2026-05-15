/* Marketing sections — manifesto, five signals, connectors, principles. */

/* =================================================================
   01 MANIFESTO — Five systems, partial truths. LumaOps converges.
   ================================================================= */
function Manifesto() {
  const sources = [
    { name: "GitHub",       knows: "repos · releases · issues" },
    { name: "Cloudflare",   knows: "visits · referrers · workers" },
    { name: "Stripe",       knows: "customers · MRR · churn" },
    { name: "Telemetry",    knows: "first launch · active · features" },
    { name: "Support",      knows: "tickets · bugs · feature requests" },
  ];
  return (
    <section id="concept" className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 40 }}>
          <span>002</span><span>The problem</span>
        </div>

        {/* The question, as a centerpiece */}
        <div className="vreveal" style={{
          maxWidth: 980,
          marginBottom: 48,
        }}>
          <h2 style={{ fontWeight: 300, lineHeight: 0.98 }}>
            Every morning, you ask one question.
            <br/>
            <span className="serif" style={{
              fontSize: "1.05em",
              color: "var(--ink)",
              backgroundImage: "linear-gradient(transparent 78%, color-mix(in oklch, var(--lumi) 75%, transparent) 78%)",
              backgroundSize: "100% 100%",
              padding: "0 4px",
            }}>
              Is this product alive, converting, shipping, earning, healthy?
            </span>
          </h2>
        </div>

        {/* Two columns — balanced */}
        <div className="vreveal manifesto-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.2fr)",
          gap: 80,
          alignItems: "stretch",
        }}>

          {/* LEFT — paragraph that fills the column */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32 }}>
            <div>
              <p style={{
                fontSize: 17, lineHeight: 1.55, color: "var(--ink-mid)",
                marginBottom: 20,
              }}>
                No single system answers it. You ship across half a dozen tools, each
                capturing a fragment of what's happening.
              </p>
              <p style={{
                fontSize: 17, lineHeight: 1.55, color: "var(--ink-mid)",
                marginBottom: 20,
              }}>
                You end up <em style={{ color: "var(--ink)" }}>stitching the truth in your head</em> —
                dashboard by dashboard, tab by tab. Every morning. LumaOps removes the stitching.
              </p>
              <p style={{
                fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-low)",
              }}>
                One workspace. Every product. One rhythm. Self-hosted, so the data
                stays where it belongs — with you.
              </p>
            </div>

            {/* footer rule with attribution */}
            <div style={{
              paddingTop: 20,
              borderTop: "1px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center", gap: 14,
            }}>
              <span style={{
                width: 22, height: 22, display: "grid", placeItems: "center",
              }}>
                <SignalConvergence />
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11.5,
                letterSpacing: "0.06em",
                color: "var(--ink-mid)",
              }}>
                The question <span style={{ color: "var(--lumi-deep)" }}>LumaOps answers</span> —
                in one room, in one rhythm.
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--ink-low)",
              }}>v0.1</span>
            </div>
          </div>

          {/* RIGHT — sources rail, monochrome + lumi convergence */}
          <div style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            background: "color-mix(in oklch, var(--paper-1) 50%, transparent)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "12px 18px",
              borderBottom: "1px solid var(--line)",
              fontFamily: "var(--font-mono)", fontSize: 10.5,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--ink-low)",
              display: "flex", justifyContent: "space-between",
            }}>
              <span>Each system knows a partial truth</span>
              <span>05 sources</span>
            </div>
            {sources.map((s, i) => (
              <div key={s.name} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                gap: 16,
                padding: "13px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--ink-dim)", flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em",
                  color: "var(--ink-mid)",
                }}>{s.name}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11.5,
                  color: "var(--ink-low)", letterSpacing: "0.02em",
                }}>{s.knows}</span>
              </div>
            ))}

            {/* convergence row — the only colored thing */}
            <div style={{
              marginTop: "auto",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center", gap: 14,
              padding: "16px 18px",
              background: "var(--ink-bg)",
              color: "var(--ink-paper)",
            }}>
              <span style={{
                width: 22, height: 22,
                display: "grid", placeItems: "center",
              }}>
                <SignalConvergence />
              </span>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: 15,
                fontWeight: 500, letterSpacing: "-0.01em",
                color: "var(--lumi-dk)",
              }}>LumaOps</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11.5,
                color: "var(--ink-text-mid)", letterSpacing: "0.02em",
              }}>one room → all signals</span>
            </div>
          </div>

        </div>

        <style>{`
          @media (max-width: 880px) {
            .manifesto-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          }
        `}</style>

      </div>
    </section>
  );
}

/* =================================================================
   02 FIVE SIGNALS — what LumaOps shows
   ================================================================= */
function FiveSignals() {
  const signals = [
    {
      verb: "shipped",
      title: "What shipped",
      desc: "Latest releases, version freshness, asset availability, changelog deltas. Tied to the repo, not guessed.",
      source: "GitHub releases",
      color: "var(--release)",
      visual: <Vsh_Shipped />,
    },
    {
      verb: "converted",
      title: "What converted",
      desc: "Visit → section view → email submitted → download started. The full funnel, with drop-off where it actually drops.",
      source: "Cloudflare + tracking",
      color: "var(--growth)",
      visual: <Vsh_Converted />,
    },
    {
      verb: "earned",
      title: "What earned",
      desc: "MRR, ARR, new customers, refunds, churn — per product, with the truth source labelled.",
      source: "Stripe",
      color: "var(--revenue)",
      visual: <Vsh_Earned />,
    },
    {
      verb: "broke",
      title: "What broke",
      desc: "Open support tickets, error spikes, failed downloads, integration warnings — surfaced before they become threads.",
      source: "Support + telemetry",
      color: "var(--support)",
      visual: <Vsh_Broke />,
    },
    {
      verb: "growing",
      title: "What's growing",
      desc: "Active users, version adoption, retention. The slow signals that say a product is taking hold.",
      source: "App telemetry",
      color: "var(--growth)",
      visual: <Vsh_Growing />,
    },
  ];

  return (
    <section className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span>003</span><span>What you see</span>
        </div>

        <h2 className="vreveal" style={{ maxWidth: 920, marginBottom: 72 }}>
          Five signals. <span className="serif" style={{ color: "var(--ink-mid)" }}>One room.</span>
        </h2>

        <div style={{
          display: "grid", gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {signals.map((s, i) => (
            <SignalRow key={s.verb} signal={s} index={i} total={signals.length} />
          ))}
        </div>

      </div>
    </section>
  );
}

function SignalRow({ signal, index, total }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className="vreveal"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "80px minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(180px, 0.8fr)",
        alignItems: "center",
        gap: 32,
        padding: "32px 28px",
        background: hovered ? "var(--paper-1)" : "var(--paper)",
        transition: "background 240ms ease",
        cursor: "default",
      }}
    >
      {/* index */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--ink-low)",
      }}>
        0{index + 1}
      </div>

      {/* big verb */}
      <div style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 300,
        fontSize: "clamp(34px, 4vw, 52px)",
        letterSpacing: "-0.035em",
        lineHeight: 1.0,
        color: "var(--ink)",
      }}>
        what <span className="serif" style={{ color: signal.color, fontSize: "1.05em" }}>{signal.verb}</span>
      </div>

      {/* desc */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 16, lineHeight: 1.5, color: "var(--ink-mid)", maxWidth: 480 }}>
          {signal.desc}
        </span>
        <span className="micro">source · {signal.source}</span>
      </div>

      {/* visual */}
      <div style={{
        height: 80,
        display: "flex", alignItems: "center", justifyContent: "stretch",
        opacity: hovered ? 1 : 0.7,
        transition: "opacity 240ms ease",
      }}>
        {signal.visual}
      </div>
    </div>
  );
}

/* ---------- Tiny inline visuals ---------- */
function Vsh_Shipped() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      {[
        { v: "v0.4.2", d: "today",  state: "ok" },
        { v: "v0.4.1", d: "12 May", state: "ok" },
        { v: "v0.4.0", d: "30 Apr", state: "ok" },
      ].map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 12,
          fontFamily: "var(--font-mono)", fontSize: 11.5, alignItems: "center",
        }}>
          <span style={{ color: "var(--release)" }}>{r.v}</span>
          <span style={{
            height: 4, background: "var(--paper-2)", borderRadius: 1, position: "relative", overflow: "hidden",
          }}>
            <span style={{
              position: "absolute", inset: 0, width: i === 0 ? "100%" : i === 1 ? "60%" : "30%",
              background: "var(--release)", opacity: 0.6,
            }} />
          </span>
          <span style={{ color: "var(--ink-low)" }}>{r.d}</span>
        </div>
      ))}
    </div>
  );
}
function Vsh_Converted() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "end", gap: 3, height: 60 }}>
      {[100, 72, 40, 24, 14].map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h}%`,
          background: i === 4 ? "var(--revenue)" : "var(--growth)",
          opacity: 0.85, borderRadius: "1px 1px 0 0",
        }} />
      ))}
    </div>
  );
}
function Vsh_Earned() {
  return (
    <Sparkline
      points={[12, 14, 13, 18, 17, 22, 24, 23, 28, 32, 31, 38]}
      color="var(--revenue)" height={64} area={true}
    />
  );
}
function Vsh_Broke() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      {[
        { l: "open",        n: 3, c: "var(--support)" },
        { l: "in progress", n: 1, c: "var(--revenue)" },
        { l: "closed",      n: 14, c: "var(--ink-low)" },
      ].map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 10, alignItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 11.5,
        }}>
          <span style={{ color: "var(--ink-mid)", letterSpacing: "0.04em" }}>{r.l}</span>
          <span style={{
            height: 4, background: "var(--paper-2)", borderRadius: 1, position: "relative", overflow: "hidden",
          }}>
            <span style={{
              position: "absolute", inset: 0, width: `${(r.n / 14) * 100}%`,
              background: r.c, opacity: 0.7,
            }} />
          </span>
          <span style={{ color: "var(--ink)" }}>{r.n}</span>
        </div>
      ))}
    </div>
  );
}
function Vsh_Growing() {
  return (
    <Sparkline
      points={[10, 12, 11, 14, 18, 17, 22, 28, 30, 35, 42, 48, 56]}
      color="var(--growth)" height={64} area={true}
    />
  );
}

/* =================================================================
   03 CONNECTORS
   ================================================================= */
function Connectors() {
  const items = [
    { name: "GitHub",        role: "Product index · releases · issues",         status: "live",    icon: "github" },
    { name: "Cloudflare",    role: "Web traffic · workers · routes · funnels",  status: "live",    icon: "cloud" },
    { name: "Stripe",        role: "Customers · MRR · churn · refunds",         status: "pending", icon: "card" },
    { name: "Tracking API",  role: "Custom funnel events · server-side",        status: "live",    icon: "signal" },
    { name: "App Telemetry", role: "First launch · active users · errors",      status: "planned", icon: "zap" },
    { name: "Support",       role: "GitHub Issues sync · native inbox · tags",  status: "live",    icon: "inbox" },
    { name: "Email",         role: "Lead delivery · open rate · bounces",       status: "planned", icon: "flag" },
  ];
  return (
    <section id="connectors" className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 56 }}>
          <span>007</span><span>Connectors</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: 80, alignItems: "start", marginBottom: 64,
        }} className="hero-grid">
          <h2 className="vreveal">
            Many sources.<br/>
            <span className="serif" style={{ color: "var(--lumi-deep)" }}>One</span> rhythm.
          </h2>
          <div className="vreveal" style={{ paddingTop: 8 }}>
            <p className="lede">
              Every connector authenticates against your own accounts, against your own credentials.
              LumaOps reads the signals, normalizes them, and brings them into one operational rhythm.
            </p>
            <p style={{ marginTop: 18, fontSize: 14.5, color: "var(--ink-low)" }}>
              Stale data is labelled stale. Missing integrations are labelled missing. No fake confidence.
            </p>
          </div>
        </div>

        <div className="connectors-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {items.map((it, i) => (
            <ConnectorTile key={it.name} item={it} />
          ))}
          <CustomConnectorTile />
        </div>

        <style>{`
          @media (max-width: 980px) { .connectors-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px) { .connectors-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </section>
  );
}

function ConnectorTile({ item }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className="vreveal"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--paper-1)" : "var(--paper)",
        padding: "24px 22px",
        display: "flex", flexDirection: "column", gap: 14,
        transition: "background 200ms ease",
        minHeight: 132,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          width: 32, height: 32, borderRadius: 7,
          background: hovered ? "var(--paper-2)" : "color-mix(in oklch, var(--paper-1) 70%, transparent)",
          border: "1px solid var(--line)",
          display: "grid", placeItems: "center",
          color: "var(--ink)",
          transition: "all 200ms ease",
        }}>
          <Icon name={item.icon} size={15} />
        </span>
        <StatusBadge status={item.status} />
      </div>

      <div>
        <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)", marginBottom: 4 }}>
          {item.name}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-mid)", letterSpacing: "0.02em", lineHeight: 1.45 }}>
          {item.role}
        </div>
      </div>
    </div>
  );
}

window.Manifesto = Manifesto;
window.FiveSignals = FiveSignals;
window.Connectors = Connectors;

/* ---------- Custom connector tile — open-source invitation ---------- */
function CustomConnectorTile() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className="vreveal"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--ink)" : "var(--paper-1)",
        color: hovered ? "var(--paper)" : "var(--ink)",
        padding: "24px 22px",
        display: "flex", flexDirection: "column", gap: 14,
        transition: "background 220ms ease, color 220ms ease",
        minHeight: 132,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* diagonal stripe background suggesting "build" */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: hovered ? 0.08 : 0.04,
        backgroundImage: "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 8px)",
        transition: "opacity 220ms ease",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <span style={{
          width: 32, height: 32, borderRadius: 7,
          background: hovered ? "rgba(255,255,255,0.08)" : "var(--paper-2)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "var(--line-2)"}`,
          display: "grid", placeItems: "center",
          color: hovered ? "var(--paper)" : "var(--ink)",
          transition: "all 220ms ease",
        }}>
          <Icon name="plus" size={14} strokeWidth={1.7} />
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: hovered ? "var(--growth-dk)" : "var(--ink-low)",
        }}>
          open framework
        </span>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 4 }}>
          Build your own
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11.5,
          color: hovered ? "var(--ink-text-mid)" : "var(--ink-mid)",
          letterSpacing: "0.02em", lineHeight: 1.45,
          transition: "color 220ms ease",
        }}>
          Write a connector against the open API. Ship it as a PR.
        </div>
      </div>
    </div>
  );
}

window.CustomConnectorTile = CustomConnectorTile;
