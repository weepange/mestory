/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0E14",
          light: "#F8FAFC",
          card: "rgba(22, 27, 34, 0.75)",
          cardHover: "rgba(30, 36, 46, 0.9)"
        },
        brand: {
          amber: "#F59E0B",
          amberDark: "#D97706",
          emerald: "#10B981",
          indigo: "#6366F1",
          rose: "#F43F5E",
          purple: "#8B5CF6"
        },
        surface: {
          dark: "#161B22",
          darker: "#0D1117",
          border: "rgba(255, 255, 255, 0.08)",
          borderGlow: "rgba(245, 158, 11, 0.3)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glowAmber: "0 0 24px -4px rgba(245, 158, 11, 0.25)",
        glowEmerald: "0 0 24px -4px rgba(16, 185, 129, 0.25)"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite"
      }
    }
  },
  plugins: []
};
