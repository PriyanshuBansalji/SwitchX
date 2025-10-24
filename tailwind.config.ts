import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        process: {
          red: "hsl(var(--process-red))",
          blue: "hsl(var(--process-blue))",
          green: "hsl(var(--process-green))",
          orange: "hsl(var(--process-orange))",
          purple: "hsl(var(--process-purple))",
          cyan: "hsl(var(--process-cyan))",
          pink: "hsl(var(--process-pink))",
          yellow: "hsl(var(--process-yellow))",
        },
        queue: {
          ready: "hsl(var(--ready-queue))",
          running: "hsl(var(--running-state))",
          completed: "hsl(var(--completed-state))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-tech': 'var(--gradient-tech)',
      },
      boxShadow: {
        'process': 'var(--shadow-process)',
        'glow': 'var(--shadow-glow)',
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
        "process-enter": {
          "0%": { opacity: "0", transform: "translateX(-20px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "process-exit": {
          "0%": { opacity: "1", transform: "translateX(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateX(20px) scale(0.9)" },
        },
        "queue-transition": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "gantt-fill": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--accent) / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--accent) / 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "process-enter": "process-enter 0.4s ease-out",
        "process-exit": "process-exit 0.4s ease-out",
        "queue-transition": "queue-transition 0.3s ease-out",
        "gantt-fill": "gantt-fill 0.5s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
