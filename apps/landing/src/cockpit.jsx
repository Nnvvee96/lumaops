/* Cockpit primitives — composable visual atoms that read as a real product surface.
   Each works on both paper (light) and dark surfaces. */

const { useEffect, useRef, useState } = React;

/* ---------- useInView ---------- */
function useInView(opts = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: opts.threshold ?? 0.2, rootMargin: opts.rootMargin ?? "0px 0px -10% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/* ---------- CountUp (tick-up on view) ---------- */
function CountUp({ to, duration = 1100, prefix = "", suffix = "", decimals = 0, format = "comma" }) {
  const [ref, seen] = useInView();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(to * eased);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  const num = decimals ? v.toFixed(decimals) : Math.round(v);
  const formatted = format === "comma" ? Number(num).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : num;
  return <span ref={ref} className="tnum">{prefix}{formatted}{suffix}</span>;
}

/* ---------- Sparkline ---------- */
function Sparkline({ points, color = "currentColor", width = 200, height = 56, area = true, fill = "none", strokeWidth = 1.4 }) {
  const [ref, seen] = useInView();
  const pad = 2;
  const xs = points.map((_, i) => pad + (i * (width - pad * 2)) / (points.length - 1));
  const min = Math.min(...points), max = Math.max(...points);
  const ys = points.map(p => height - pad - ((p - min) / Math.max(0.001, (max - min))) * (height - pad * 2));
  const d = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(2)},${ys[i].toFixed(2)}`).join(" ");
  const areaD = area ? `${d} L ${xs[xs.length - 1]},${height} L ${xs[0]},${height} Z` : null;
  const len = Math.round(width * 1.4);
  return (
    <svg ref={ref} className={"spark " + (seen ? "in" : "")} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, "--len": len }}>
      {area && (
        <path d={areaD} fill={fill === "none" ? `color-mix(in oklch, ${color} 10%, transparent)` : fill} stroke="none" />
      )}
      <path d={d} stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

/* ---------- Bars (vertical) ---------- */
function Bars({ values, height = 40, color = "currentColor", lastColor }) {
  const [ref, seen] = useInView();
  const max = Math.max(...values);
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const c = (i === values.length - 1 && lastColor) ? lastColor : color;
        return (
          <div key={i} style={{
            flex: 1,
            height: `${h}%`,
            background: c,
            opacity: 0.85,
            transformOrigin: "bottom",
            transform: seen ? "scaleY(1)" : "scaleY(0)",
            transition: `transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 30}ms`,
            borderRadius: "1px 1px 0 0",
          }} />
        );
      })}
    </div>
  );
}

/* ---------- Panel ---------- */
function Panel({ title, meta, accent, dark = false, children, style, headerExtra }) {
  return (
    <div style={{
      background: dark ? "var(--ink-bg-1)" : "color-mix(in oklch, var(--paper-1) 70%, transparent)",
      border: `1px solid ${dark ? "var(--ink-line)" : "var(--line)"}`,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      ...style,
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${dark ? "var(--ink-line)" : "var(--line)"}`,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: dark ? "var(--ink-text-mid)" : "var(--ink-mid)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {accent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block" }} />}
            {title}
          </span>
          <span style={{ color: dark ? "var(--ink-text-low)" : "var(--ink-low)" }}>{meta}</span>
        </div>
      )}
      {headerExtra}
      {children}
    </div>
  );
}

/* ---------- MetricCell — used inside a grid of cells ---------- */
function MetricCell({ label, value, delta, deltaTone = "up", suffix, prefix, dark = false, decimals = 0 }) {
  const tone = deltaTone === "up" ? (dark ? "var(--growth-dk)" : "var(--growth)")
             : deltaTone === "down" ? (dark ? "var(--support-dk)" : "var(--support)")
             : (dark ? "var(--ink-text-low)" : "var(--ink-low)");
  return (
    <div style={{ padding: "16px 18px", background: dark ? "var(--ink-bg-1)" : "transparent", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.1em",
        textTransform: "uppercase", color: dark ? "var(--ink-text-low)" : "var(--ink-low)",
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 26, fontWeight: 400, letterSpacing: "-0.025em",
        color: dark ? "var(--ink-paper)" : "var(--ink)",
      }} className="tnum">
        <CountUp to={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {delta && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: tone, letterSpacing: "0.02em" }}>
          {deltaTone === "up" ? "▲" : deltaTone === "down" ? "▼" : "─"} {delta}
        </div>
      )}
    </div>
  );
}

/* ---------- FunnelRow ---------- */
function FunnelRow({ label, value, pct, color, max, dark = false, delay = 0 }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{
      display: "grid",
      gridTemplateColumns: "minmax(110px, 130px) 1fr minmax(60px, 80px)",
      alignItems: "center", gap: 14,
      padding: "7px 0",
      fontFamily: "var(--font-mono)", fontSize: 11.5,
    }}>
      <span style={{ color: dark ? "var(--ink-text-mid)" : "var(--ink-mid)", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{
        height: 18,
        background: dark ? "var(--ink-bg-2)" : "var(--paper-2)",
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: color,
          opacity: 0.92,
          transformOrigin: "left",
          transform: seen ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
        }} />
        <span style={{
          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
          fontSize: 10.5, color: dark ? "var(--ink-text-low)" : "var(--ink-low)",
          letterSpacing: "0.04em",
        }}>{pct.toFixed(1)}%</span>
      </span>
      <span className="tnum" style={{
        textAlign: "right",
        color: dark ? "var(--ink-paper)" : "var(--ink)",
        fontFeatureSettings: '"tnum"',
      }}>
        {seen ? value.toLocaleString("en-US") : "0"}
      </span>
    </div>
  );
}

/* ---------- StatusBadge ---------- */
function StatusBadge({ status, dark = false }) {
  const map = {
    live:    { color: dark ? "var(--growth-dk)" : "var(--growth)", label: "live" },
    syncing: { color: dark ? "var(--growth-dk)" : "var(--growth)", label: "syncing" },
    planned: { color: dark ? "var(--ink-text-low)" : "var(--ink-low)", label: "planned" },
    pending: { color: dark ? "var(--revenue-dk)" : "var(--revenue)", label: "pending" },
    stale:   { color: dark ? "var(--support-dk)" : "var(--support)", label: "stale" },
  };
  const s = map[status] || map.live;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: s.color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.color,
        boxShadow: status !== "planned" ? `0 0 0 3px color-mix(in oklch, ${s.color} 22%, transparent)` : "none",
        animation: status === "live" || status === "syncing" ? "pulse 2.4s ease-in-out infinite" : "none",
      }} />
      {s.label}
    </span>
  );
}

window.useInView = useInView;
window.CountUp = CountUp;
window.Sparkline = Sparkline;
window.Bars = Bars;
window.Panel = Panel;
window.MetricCell = MetricCell;
window.FunnelRow = FunnelRow;
window.StatusBadge = StatusBadge;
