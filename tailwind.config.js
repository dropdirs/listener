/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
        // Retro Robotic 1970s Theme
        "retro-bg": "hsl(var(--retro-bg))",
        "retro-text": "hsl(var(--retro-text))",
        "retro-border": "hsl(var(--retro-border))",
        "retro-header": "hsl(var(--retro-header))",
        "retro-input": "hsl(var(--retro-input))",
        "retro-button": "hsl(var(--retro-button))",
        "retro-button-hover": "hsl(var(--retro-button-hover))",
        "retro-user-msg": "hsl(var(--retro-user-msg))",
        "retro-other-msg": "hsl(var(--retro-other-msg))",
        "retro-accent": "hsl(var(--retro-accent))",
        "retro-terminal": "hsl(var(--retro-terminal))",
        "retro-robot": "hsl(var(--retro-robot))",
        "retro-grid": "hsl(var(--retro-grid))",
        "retro-glow": "hsl(var(--retro-glow))",
      },
      fontFamily: {
        mono: ["'VT323'", "'Space Mono'", "monospace"],
        retro: ["'VT323'", "'Press Start 2P'", "monospace"],
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
  plugins: [require("tailwindcss-animate")],
};
