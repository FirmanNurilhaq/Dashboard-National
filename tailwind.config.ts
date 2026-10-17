import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        background: "#f5f5f7",
        surface: "rgba(255, 255, 255, 0.7)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        emerald: {
          50: "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        amber: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        rose: {
          50: "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04), 0 2px 8px 0 rgba(0, 0, 0, 0.02)",
        "glass-hover": "0 14px 40px 0 rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
