import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-void": "#060810",
        "bg-primary": "#0C1120",
        "bg-card": "#121A2E",
        "bg-elevated": "#192235",
        "bg-input": "#1E2A40",
        brand: "#00D4AA",
        "brand-bright": "#00FFD1",
        "brand-dim": "#00D4AA18",
        "brand-border": "#00D4AA30",
        semantic: "#8B5CF6",
        episodic: "#3B82F6",
        instruction: "#00D4AA",
        document: "#F59E0B",
        "text-primary": "#F0F4FF",
        "text-secondary": "#8B9CC8",
        "text-muted": "#4F5E7A",
        "text-code": "#00D4AA",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px #00D4AA40" },
          "50%": { boxShadow: "0 0 24px #00D4AA80" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;
