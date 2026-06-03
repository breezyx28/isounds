import type { Config } from "tailwindcss";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        border: "var(--color-border)",
        primary: {
          DEFAULT: "var(--color-primary)",
          bright: "var(--color-primary-bright)",
          deep: "var(--color-primary-deep)",
          glow: "var(--color-primary-glow)",
        },
        accent: "var(--color-accent)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          disabled: "var(--color-text-disabled)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        zain: "var(--color-zain)",
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["72px", { lineHeight: "1.1" }],
        "display-xl": ["56px", { lineHeight: "1.1" }],
        "display-lg": ["40px", { lineHeight: "1.15" }],
        "display-md": ["32px", { lineHeight: "1.2" }],
        "heading-lg": ["24px", { lineHeight: "1.3" }],
        "heading-md": ["20px", { lineHeight: "1.3" }],
        "body-lg": ["16px", { lineHeight: "1.6" }],
        "body-md": ["14px", { lineHeight: "1.5" }],
        label: ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        glow: "0 10px 30px -16px var(--color-primary-glow)",
        soft: "0 12px 28px -18px rgba(10, 12, 20, 0.45)",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "200% center" },
          to: { backgroundPosition: "-200% center" },
        },
        "cell-ripple": {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0.4" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "cell-ripple":
          "cell-ripple var(--duration, 200ms) ease-out var(--delay, 0ms) 1",
      },
    },
  },
  plugins: [],
} satisfies Config;
