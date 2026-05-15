import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// LumaOps cockpit Tailwind config.
// shadcn semantic tokens (hsl-wrapped) live alongside LumaOps named
// tokens (paper / ink / lumi / signal palette) consumed directly via
// var(--…). Both are defined in src/app/globals.css.
const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // shadcn semantic
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // LumaOps named tokens — direct var() references
        paper: {
          DEFAULT: "var(--paper)",
          1: "var(--paper-1)",
          2: "var(--paper-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          mid: "var(--ink-mid)",
          low: "var(--ink-low)",
          dim: "var(--ink-dim)",
          bg: "var(--ink-bg)",
          "bg-1": "var(--ink-bg-1)",
          "bg-2": "var(--ink-bg-2)",
          line: "var(--ink-line)",
          "line-2": "var(--ink-line-2)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        lumi: {
          DEFAULT: "var(--lumi)",
          dk: "var(--lumi-dk)",
          deep: "var(--lumi-deep)",
          soft: "var(--lumi-soft)",
        },

        // Signal palette — data contexts only
        growth: "var(--growth)",
        revenue: "var(--revenue)",
        release: "var(--release)",
        support: "var(--support)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-serif)", "Iowan Old Style", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
