import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./messages/**/*.{json,md}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          soft: "hsl(var(--brand-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-app-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 12px 48px rgba(179, 12, 49, 0.18)",
        soft: "0 8px 32px rgba(19, 25, 37, 0.1), 0 2px 8px rgba(179, 12, 49, 0.06)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(179, 12, 49, 0.24), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 122, 89, 0.16), transparent 22%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        toastIn: {
          from: { opacity: "0", transform: "translateX(100%) scale(0.95)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        slideIn: "slideIn 0.6s ease-out both",
        toastIn: "toastIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
