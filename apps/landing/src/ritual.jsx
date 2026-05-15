/* DAILY RITUAL — narrative section showing the operator's morning with LumaOps.
   Concrete, time-stamped beats that make the abstract vision tangible. */

function DailyRitual() {
  const beats = [
    {
      time: "09:14",
      title: "Coffee in hand, cockpit open.",
      desc: "One screen. Four products. You see what shipped overnight, what's converting, what's earning, what broke.",
      anchor: "overview",
      visual: <Beat1 />,
    },
    {
      time: "09:16",
      title: "NOESIS leads spiked.",
      desc: "+47 beta signups since yesterday — biggest day yet. You drill in, the funnel is healthy. No drop-off at email.",
      anchor: "funnel",
      visual: <Beat2 />,
    },
    {
      time: "09:18",
      title: "Two new support tickets.",
      desc: "Both tagged \"download · macOS Intel\" — the same release-asset problem. You note it, the next deploy fixes it at the root.",
      anchor: "support",
      visual: <Beat3 />,
    },
    {
      time: "09:22",
      title: "Planora waitlist crossed 1,000.",
      desc: "A small celebration, a fresh email to the list. The launch funnel is wired and waiting.",
      anchor: "milestone",
      visual: <Beat4 />,
    },
    {
      time: "09:30",
      title: "Cockpit closed.",
      desc: "You know what to do today. No tabs left open, no truth left stitched. Just the work.",
      anchor: "close",
      visual: <Beat5 />,
    },
  ];

  return (
    <section className="section-pad-lg">
      <div className="wrap">

        <div className="vreveal num-tag" style={{ marginBottom: 40 }}>
          <span>006</span><span>Your morning, with LumaOps</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: 80, alignItems: "end", marginBottom: 64,
        }} className="hero-grid">
          <h2 className="vreveal">
            <span className="serif" style={{ color: "var(--lumi-deep)" }}>Sixteen</span> minutes.<br/>
            Everything you need.
          </h2>
          <p className="lede vreveal">
            LumaOps isn't a place you live. It's a place you visit — for as long as you need.
            Sixteen minutes a morning is enough to know every product is alive, every signal
            is honest, every fire is small enough to handle.
          </p>
        </div>

        {/* Timeline beats */}
        <div className="ritual-track" style={{ position: "relative" }}>
          {/* Vertical line */}
          <div className="ritual-line" aria-hidden="true" style={{
            position: "absolute",
            left: 70,
            top: 12, bottom: 12,
            width: 1,
            background: "linear-gradient(to bottom, transparent 0%, var(--line-2) 12%, var(--line-2) 88%, transparent 100%)",
          }} />

          {beats.map((b, i) => (
            <RitualBeat key={i} beat={b} index={i} isLast={i === beats.length - 1} />
          ))}
        </div>

        {/* Closing line */}
        <div className="vreveal" style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "clamp(20px, 2.2vw, 28px)",
            letterSpacing: "-0.015em",
            color: "var(--ink)",
          }}>
            A founder's morning, not a marketing dashboard.
          </span>
          <span className="micro">— the ritual</span>
        </div>

      </div>

      <style>{`
        @media (max-width: 760px) {
          .ritual-line { left: 12px !important; }
        }
      `}</style>
    </section>
  );
}

function RitualBeat({ beat, index, isLast }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} className="ritual-beat" style={{
      display: "grid",
      gridTemplateColumns: "100px 1fr minmax(240px, 360px)",
      gap: 40,
      padding: "24px 0 28px",
      borderBottom: isLast ? "none" : "1px solid var(--line)",
      opacity: seen ? 1 : 0,
      transform: seen ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 100}ms, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 100}ms`,
      alignItems: "start",
    }}>

      {/* Time + dot */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 14,
          fontWeight: 500, color: "var(--ink)",
          letterSpacing: "-0.005em",
          minWidth: 44,
        }} className="tnum">{beat.time}</span>
        <span style={{
          width: 11, height: 11, borderRadius: "50%",
          background: index === 0 || index === 4 ? "var(--lumi)" : "var(--paper)",
          border: `1.5px solid ${index === 0 || index === 4 ? "var(--lumi-deep)" : "var(--line-2)"}`,
          boxShadow: index === 0
            ? "0 0 0 4px color-mix(in oklch, var(--lumi) 25%, transparent)"
            : "0 0 0 4px var(--paper)",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }} />
      </div>

      {/* Content */}
      <div>
        <h3 style={{
          fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em",
          color: "var(--ink)", marginBottom: 10,
        }}>{beat.title}</h3>
        <p style={{
          fontSize: 15.5, lineHeight: 1.55, color: "var(--ink-mid)",
          maxWidth: 540,
        }}>{beat.desc}</p>
      </div>

      {/* Visual */}
      <div>
        {beat.visual}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .ritual-beat {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* Mini visuals per beat */
function Beat1() {
  // 4 products in 2x2 grid with favicons + full names
  const ps = [
    { n: "ApplyIQ",  d: "applyiq.app" },
    { n: "Planora",  d: "getplanora.app" },
    { n: "OHARA",    d: "ohara-labs.com" },
    { n: "NOESIS",   d: "noesis.tools" },
  ];
  return (
    <div style={{
      background: "var(--paper-1)",
      border: "1px solid var(--line)",
      borderRadius: 8,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-low)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 8,
      }}>
        <span>4 products</span>
        <span style={{ color: "var(--lumi-deep)" }}>● all green</span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
      }}>
        {ps.map((p, i) => (
          <div key={i} style={{
            padding: "6px 8px",
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-mid)",
            minWidth: 0,
          }}>
            <img
              src={`https://www.google.com/s2/favicons?domain=${p.d}&sz=32`}
              alt=""
              style={{ width: 12, height: 12, borderRadius: 2, flexShrink: 0 }}
            />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Beat2() {
  return (
    <div style={{
      background: "var(--paper-1)",
      border: "1px solid var(--line)",
      borderRadius: 8,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-low)",
      }}>
        <span>NOESIS · leads</span>
        <span style={{ color: "var(--lumi-deep)" }}>+47 today</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="tnum" style={{ fontSize: 26, color: "var(--ink)", letterSpacing: "-0.02em" }}>486</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--lumi-deep)" }}>▲ biggest day</span>
      </div>
      <Sparkline points={[40, 58, 51, 64, 72, 89, 142]} color="var(--lumi-deep)" height={32} area />
    </div>
  );
}

function Beat3() {
  return (
    <div style={{
      background: "var(--paper-1)",
      border: "1px solid var(--line)",
      borderRadius: 8,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-low)",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>2 open · support</span>
        <span style={{ color: "var(--support)" }}>1 new</span>
      </div>
      {[
        "macOS Intel · download failed",
        "macOS Intel · 404 on asset",
      ].map((t, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 4,
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--ink-mid)",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--support)",
          }} />
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function Beat4() {
  return (
    <div style={{
      background: "var(--ink-bg)",
      color: "var(--ink-paper)",
      borderRadius: 8,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-text-low)",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>PLANORA · WAITLIST</span>
        <span style={{ color: "var(--lumi-dk)" }}>● 1,000 milestone</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="tnum" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>1,284</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--lumi-dk)" }}>+38 today</span>
      </div>
      <Sparkline points={[180, 320, 480, 640, 820, 1050, 1284]} color="var(--lumi-dk)" height={30} area />
    </div>
  );
}

function Beat5() {
  return (
    <div style={{
      background: "var(--paper-1)",
      border: "1px dashed var(--line-2)",
      borderRadius: 8,
      padding: "18px 14px",
      display: "flex", flexDirection: "column", gap: 6,
      alignItems: "center", justifyContent: "center",
      minHeight: 100,
      textAlign: "center",
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--ink-low)",
      }}>Session closed</span>
      <span style={{
        fontFamily: "var(--font-serif)", fontStyle: "italic",
        fontSize: 17, color: "var(--ink)",
        letterSpacing: "-0.01em",
      }}>Now the work begins.</span>
    </div>
  );
}

window.DailyRitual = DailyRitual;
