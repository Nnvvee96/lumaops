/* Monoline icons & logo lockup. */
const ic = {
  arrow:     "M5 12h14M13 6l6 6-6 6",
  arrowSm:   "M4 8h8M9 5l3 3-3 3",
  arrowUp:   "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  arrowDR:   "M5 19L19 5M9 5h10v10",
  ext:       "M14 4h6v6M20 4l-9 9M5 5h6M5 19h14v-6",
  sun:       "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 7a5 5 0 100 10 5 5 0 000-10z",
  moon:      "M20 14.8A8 8 0 119.2 4a6.5 6.5 0 0010.8 10.8z",
  github:    "M12 2.2a10 10 0 00-3.16 19.49c.5.1.68-.21.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.9 1.53 2.36 1.09 2.94.84.09-.66.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.59.69.49A10 10 0 0012 2.2z",
  cloud:     "M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 1117 18z",
  card:      "M3 6h18v12H3zM3 10h18M7 15h3",
  flag:      "M4 21V4M4 4h12l-2 4 2 4H4",
  signal:    "M4 20h2M9 16h2M14 12h2M19 8h2",
  link:      "M9 15l6-6M10 7h-3a4 4 0 100 8h3M14 17h3a4 4 0 100-8h-3",
  shield:    "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z",
  terminal:  "M4 4h16v16H4zM7 9l3 3-3 3M12 15h6",
  cube:      "M12 2l9 5v10l-9 5-9-5V7zM12 2v20M3 7l9 5 9-5",
  inbox:     "M3 13h6l2 3h2l2-3h6M4 4h16v16H4zM4 13v7M20 13v7",
  funnel:    "M3 4h18l-7 9v6l-4 2v-8z",
  zap:       "M13 2L4 14h7l-1 8 9-12h-7z",
  layers:    "M12 2l10 6-10 6L2 8zM2 12l10 6 10-6M2 16l10 6 10-6",
  check:     "M5 12l4 4 10-10",
  plus:      "M12 5v14M5 12h14",
  minus:     "M5 12h14",
  dot:       "M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0",
  search:    "M11 11m-7 0a7 7 0 1014 0 7 7 0 10-14 0M21 21l-5-5",
};

function Icon({ name, size = 16, stroke = "currentColor", strokeWidth = 1.5, fill = "none", style }) {
  const d = ic[name] || ic.dot;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path d={d} fill={fill === "none" ? "none" : fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* LumaOps mark — Convergence.
   Four signal lines flow from the cardinal edges into a luminous center node.
   Reads as: fragmented sources converging into one room.
   The mark IS the product story rendered as a glyph. */
function LumaMark({ size = 22, color = "currentColor", accent, pulse = false }) {
  const stroke = color;
  const dot = accent || "var(--lumi)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ overflow: "visible" }}>
      {/* Four converging signal lines (top, right, bottom, left) */}
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <line x1="16" y1="3"  x2="16" y2="12" />
        <line x1="29" y1="16" x2="20" y2="16" />
        <line x1="16" y1="29" x2="16" y2="20" />
        <line x1="3"  y1="16" x2="12" y2="16" />
      </g>
      {/* Pulse halo */}
      {pulse && (
        <circle cx="16" cy="16" r="6" fill="none" stroke={dot} strokeOpacity="0.5" strokeWidth="0.9">
          <animate attributeName="r" values="3.5;9;3.5" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.55;0;0.55" dur="2.6s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Inner glow */}
      <circle cx="16" cy="16" r="5" fill={dot} opacity="0.18" />
      {/* Center node */}
      <circle cx="16" cy="16" r="3.2" fill={dot} />
      {/* Center highlight */}
      <circle cx="14.8" cy="14.8" r="0.9" fill="white" opacity="0.55" />
    </svg>
  );
}

function Wordmark({ small = false, color, accent, pulse = true }) {
  const fs = small ? 15 : 18;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "Geist, sans-serif",
      fontSize: fs,
      fontWeight: 500,
      letterSpacing: "-0.018em",
      color: color || "var(--ink)",
    }}>
      <LumaMark size={small ? 20 : 26} color={color || "var(--ink)"} accent={accent || "var(--lumi)"} pulse={pulse} />
      <span>LumaOps</span>
    </span>
  );
}

window.Icon = Icon;
window.LumaMark = LumaMark;
window.Wordmark = Wordmark;
window.ic = ic;
