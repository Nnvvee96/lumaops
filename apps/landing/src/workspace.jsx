/* WORKSPACE — multi-product overview.
   The missing centerpiece: showing that LumaOps is multi-product first-class.
   Built around the operator's real studio of products. */

const { useState: useStateW, useRef: useRefW } = React;

function WorkspaceSection() {
  const products = [
    {
      id: "applyiq",
      domain: "applyiq.app",
      name: "ApplyIQ",
      tagline: "Canva for job applications",
      type: "web app",
      status: "beta",
      health: 0.84,
      metric: { label: "weekly visits", value: 4218, delta: "+12.4%", tone: "up" },
      spark: [220, 280, 310, 290, 340, 380, 412],
      release: "v0.2.1 · 3d",
      issues: 2,
      mark: "A",
    },
    {
      id: "planora",
      domain: "getplanora.app",
      name: "Planora",
      tagline: "AI travel planner",
      type: "web app",
      status: "pre-launch",
      health: 0.62,
      metric: { label: "waitlist", value: 1284, delta: "+38 today", tone: "up" },
      spark: [60, 90, 110, 145, 180, 240, 320],
      release: "v0.1.0 · 14d",
      issues: 5,
      mark: "P",
    },
    {
      id: "ohara",
      domain: "ohara-labs.com",
      name: "OHARA",
      tagline: "Living knowledge civilization",
      type: "research system",
      status: "active",
      health: 0.91,
      metric: { label: "knowledge entries", value: 1842, delta: "+24 today", tone: "up" },
      spark: [820, 1020, 1180, 1340, 1510, 1690, 1842],
      release: "phase 1 · live",
      issues: 0,
      mark: "O",
    },
    {
      id: "noesis",
      domain: "noesis.tools",
      name: "NOESIS.Tools",
      tagline: "Desktop assistant",
      type: "desktop app",
      status: "beta",
      health: 0.78,
      metric: { label: "downloads", value: 142, delta: "+8.4%", tone: "up" },
      spark: [12, 28, 56, 78, 96, 118, 142],
      release: "v0.4.2 · 2d",
      issues: 3,
      mark: "N",
    },
  ];

  return (
    <section id="workspace" className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 40 }}>
          <span>004</span><span>Your workspace</span>
        </div>

        <div className="vreveal" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: 80, alignItems: "end", marginBottom: 56,
        }} className="hero-grid">
          <h2>
            Every product.<br/>
            <span className="serif" style={{ color: "var(--lumi-deep)" }}>One</span> studio.
          </h2>
          <p className="lede">
            LumaOps treats every product as a first-class object — idea, beta, live, paused.
            Compare them at a glance, drill into any one, run them in parallel.
            One workspace, one rhythm.
          </p>
        </div>

        {/* The workspace card */}
        <div className="vreveal corners" style={{ position: "relative" }}>
          <span className="ct l"></span><span className="ct r"></span>
          <span className="cb l"></span><span className="cb r"></span>

          <div style={{
            background: "var(--paper-1)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            boxShadow: "0 30px 80px -50px rgba(20,15,5,0.18)",
          }}>

            {/* Header */}
            <div style={{
              padding: "16px 22px",
              borderBottom: "1px solid var(--line)",
              background: "var(--paper)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <LumaMark size={22} color="var(--ink)" accent="var(--lumi)" pulse />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
                    Navyug — Indie Studio
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10.5,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--ink-low)", marginTop: 2,
                  }}>4 products · 1 workspace · local</span>
                </div>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--ink-low)",
              }}>
                <span>RANGE · 7D</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-dim)" }} />
                <span style={{ color: "var(--lumi-deep)" }}>● ALL SYNCED</span>
              </div>
            </div>

            {/* Summary bar */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "var(--line)",
              borderBottom: "1px solid var(--line)",
            }}>
              <SummaryCell label="combined visits" value="17,762" delta="+18.2%" />
              <SummaryCell label="active products" value="4" delta="0 paused" deltaNeutral />
              <SummaryCell label="open issues" value="10" delta="2 new today" tone="down" />
              <SummaryCell label="last release" value="3 days ago" delta="ApplyIQ" deltaNeutral />
            </div>

            {/* Products table */}
            <div style={{
              padding: "8px 6px",
            }}>
              {/* table header */}
              <div className="workspace-row workspace-head" style={{
                display: "grid",
                padding: "10px 18px",
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--ink-low)",
              }}>
                <span>product</span>
                <span>status</span>
                <span>key metric</span>
                <span style={{ textAlign: "right" }}>7d trend</span>
                <span style={{ textAlign: "right" }}>last release</span>
                <span style={{ textAlign: "right" }}>issues</span>
                <span></span>
              </div>

              {products.map((p, i) => (
                <ProductRow key={p.id} product={p} index={i} />
              ))}

              {/* Add product hint */}
              <div className="workspace-row" style={{
                display: "grid",
                alignItems: "center",
                padding: "14px 18px",
                marginTop: 4,
                borderTop: "1px dashed var(--line-2)",
                color: "var(--ink-low)",
                fontFamily: "var(--font-mono)", fontSize: 12,
                cursor: "default",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 6,
                    border: "1px dashed var(--line-2)",
                    display: "grid", placeItems: "center",
                  }}>
                    <Icon name="plus" size={12} />
                  </span>
                  Add product
                </span>
                <span></span>
                <span>connect a new repo</span>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>

          </div>
        </div>

        {/* Footnote below workspace card */}
        <div className="vreveal" style={{
          marginTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.06em",
          color: "var(--ink-low)",
        }}>
          <span>SHARED CONNECTORS · PER-PRODUCT METRICS · CROSS-PRODUCT HEALTH</span>
          <span style={{ color: "var(--ink-mid)" }}>Built for studios with more than one bet running.</span>
        </div>

        <style>{`
          .workspace-row {
            grid-template-columns: minmax(220px, 1.6fr) 100px minmax(160px, 1.4fr) 90px 110px 70px 24px;
            gap: 18px;
          }
          .workspace-head {
            border-bottom: 1px solid var(--line);
          }
          @media (max-width: 980px) {
            .workspace-head { display: none !important; }
            .workspace-row {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              padding: 18px 18px !important;
            }
          }
        `}</style>

      </div>
    </section>
  );
}

function SummaryCell({ label, value, delta, deltaNeutral, tone = "up" }) {
  const toneColor = deltaNeutral ? "var(--ink-low)"
                  : tone === "down" ? "var(--support)"
                  : "var(--lumi-deep)";
  return (
    <div style={{
      background: "var(--paper)",
      padding: "14px 18px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-low)",
      }}>{label}</span>
      <span className="tnum" style={{
        fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em",
        color: "var(--ink)",
      }}>{value}</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        color: toneColor, letterSpacing: "0.02em",
      }}>{delta}</span>
    </div>
  );
}

function ProductRow({ product, index }) {
  const [hovered, setHovered] = useStateW(false);
  const statusMap = {
    "live":       { color: "var(--lumi-deep)",  bg: "color-mix(in oklch, var(--lumi) 15%, transparent)" },
    "beta":       { color: "var(--lumi-deep)",  bg: "color-mix(in oklch, var(--lumi) 12%, transparent)" },
    "pre-launch": { color: "var(--revenue)",    bg: "color-mix(in oklch, var(--revenue) 10%, transparent)" },
    "active":     { color: "var(--lumi-deep)",  bg: "color-mix(in oklch, var(--lumi) 15%, transparent)" },
    "paused":     { color: "var(--ink-low)",    bg: "var(--paper-2)" },
    "idea":       { color: "var(--ink-low)",    bg: "var(--paper-2)" },
  };
  const s = statusMap[product.status] || statusMap.beta;
  const toneColor = product.metric.tone === "up" ? "var(--lumi-deep)" : "var(--support)";

  return (
    <div className="workspace-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        alignItems: "center",
        padding: "16px 18px",
        background: hovered ? "var(--paper)" : "transparent",
        borderRadius: 8,
        cursor: "default",
        transition: "background 200ms ease",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Product name + tagline */}
      <span style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 7,
          background: "var(--paper)",
          border: `1px solid ${hovered ? "var(--line-2)" : "var(--line)"}`,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
          color: "var(--ink)",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          boxShadow: hovered ? "0 0 0 3px color-mix(in oklch, var(--lumi) 18%, transparent)" : "none",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${product.domain}&sz=64`}
            alt=""
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{
              width: 22, height: 22,
              borderRadius: 4,
              objectFit: "contain",
            }}
          />
          {/* Letter fallback behind image */}
          <span style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
            color: "var(--ink-low)",
          }}>{product.mark}</span>
        </span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
          <span style={{
            fontSize: 15.5, fontWeight: 500, letterSpacing: "-0.01em",
            color: "var(--ink)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{product.name}</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-low)", letterSpacing: "0.02em",
            marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{product.domain} · {product.tagline}</span>
        </span>
      </span>

      {/* Status */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "3px 9px", borderRadius: 999,
        background: s.bg,
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: s.color, width: "fit-content",
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: s.color,
          boxShadow: product.status !== "paused" && product.status !== "idea"
            ? `0 0 0 2px color-mix(in oklch, ${s.color} 25%, transparent)` : "none",
        }} />
        {product.status}
      </span>

      {/* Key metric */}
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--ink-low)",
        }}>{product.metric.label}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
          <span className="tnum" style={{ fontSize: 18, fontWeight: 400, letterSpacing: "-0.015em", color: "var(--ink)" }}>
            {product.metric.value.toLocaleString("en-US")}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: toneColor }}>
            {product.metric.delta}
          </span>
        </span>
      </span>

      {/* Sparkline */}
      <span style={{ width: 80, height: 28 }}>
        <Sparkline points={product.spark} color={toneColor} height={28} strokeWidth={1.4} area />
      </span>

      {/* Last release */}
      <span style={{
        textAlign: "right",
        fontFamily: "var(--font-mono)", fontSize: 11.5,
        color: "var(--ink-mid)", letterSpacing: "0.02em",
      }}>{product.release}</span>

      {/* Issues */}
      <span style={{
        textAlign: "right",
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: product.issues > 0 ? "var(--support)" : "var(--ink-low)",
      }}>
        {product.issues > 0 ? product.issues : "—"}
      </span>

      {/* Drill-in arrow */}
      <span style={{
        textAlign: "right",
        color: hovered ? "var(--ink)" : "var(--ink-dim)",
        fontFamily: "var(--font-mono)", fontSize: 14,
        transition: "color 200ms ease, transform 200ms ease",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
      }}>→</span>
    </div>
  );
}

window.WorkspaceSection = WorkspaceSection;
