import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        herbal: {
          50: "#f4faf4",
          100: "#e3f2e4",
          200: "#c8e4ca",
          300: "#9dce9f",
          400: "#6fb072",
          500: "#4a9250",
          600: "#3a7540",
          700: "#315d35",
          800: "#2a4c2e",
          900: "#243f27",
        },
        sage: "#5c7a5e",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(36, 63, 39, 0.08), 0 2px 8px rgba(36, 63, 39, 0.04)",
        lift: "0 20px 40px -12px rgba(36, 63, 39, 0.15), 0 8px 16px -8px rgba(36, 63, 39, 0.1)",
        glow: "0 0 40px -8px rgba(74, 146, 80, 0.45)",
      },
      animation: {
        "fade-in": "fadeIn 0.55s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "float-slow": "floatSlow 22s ease-in-out infinite",
        "float-delayed": "floatSlow 30s ease-in-out infinite reverse",
        "pulse-glow": "pulseGlow 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.06)" },
          "66%": { transform: "translate(-4%, 3%) scale(0.94)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
