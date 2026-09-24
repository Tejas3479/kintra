import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // The Executive Monolith Palette
        obsidian: {
          950: "#07080a", // Core canvas void
          900: "#0d0f13", // Elevated layer
          850: "#12151b", // Card base surface
          800: "#181c24", // Card interactive surface
          750: "#1f242f", // Hover surface
          700: "#282e3c", // Specular edge border
          600: "#3b4356", // High-contrast border
        },
        champagne: {
          200: "#f7efe4",
          300: "#eedcc5",
          400: "#e2c9a0", // Luminous metallic gold
          500: "#d4b483", // Signature executive gold accent
          600: "#b9935b",
          700: "#93703c",
          800: "#5a4220",
          900: "#332410", // Ambient glow tint
        },
        platinum: {
          100: "#f8f9fa",
          200: "#f1f3f5",
          300: "#e2e8f0",
          400: "#94a3b8",
          500: "#64748b",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        radar: "radarSweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.02)" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      boxShadow: {
        "gold-glow": "0 0 25px -4px rgba(212, 180, 131, 0.25)",
        "gold-glow-lg": "0 0 45px -5px rgba(212, 180, 131, 0.35)",
        "obsidian-elevated": "0 8px 32px -4px rgba(0, 0, 0, 0.7), 0 2px 8px -2px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
