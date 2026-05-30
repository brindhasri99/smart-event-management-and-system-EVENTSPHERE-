import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        accent: "var(--accent)",
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      keyframes: {
        scanline: {
          "0%": { top: "5%" },
          "100%": { top: "95%" },
        },
      },
      animation: {
        scanline: "scanline 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
}

export default config
