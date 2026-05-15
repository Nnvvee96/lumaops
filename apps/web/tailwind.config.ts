import type { Config } from "tailwindcss";

// Minimal Tailwind config. Full LumaOps design tokens (Lumi palette,
// signal colors, Geist + Instrument Serif font stack) ship in S2D.
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
