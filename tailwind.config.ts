import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(223 28% 8%)",
        foreground: "hsl(42 18% 92%)",
        card: "hsl(223 24% 12%)",
        primary: "hsl(154 51% 46%)",
        "primary-foreground": "hsl(220 30% 10%)",
        secondary: "hsl(223 18% 18%)",
        muted: "hsl(223 16% 16%)",
        accent: "hsl(23 88% 61%)",
        border: "hsl(223 16% 24%)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
