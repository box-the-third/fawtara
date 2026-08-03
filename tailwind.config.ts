import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598fff",
          500: "#3366ff",
          600: "#1f47f5",
          700: "#1836e1",
          800: "#1a2fb6",
          900: "#1c2e8f",
        },
        ink: {
          DEFAULT: "#0b1020",
          soft: "#3a4256",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["Cairo", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,16,32,.04), 0 8px 30px rgba(11,16,32,.06)",
        card: "0 1px 3px rgba(11,16,32,.06), 0 12px 40px rgba(11,16,32,.08)",
      },
    },
  },
  plugins: [],
};

export default config;
