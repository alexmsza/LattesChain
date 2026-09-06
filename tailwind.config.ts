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
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0e0a18",
          800: "#1b152c",
          700: "#241c38",
          600: "#342750",
        },
        gold: {
          400: "#f6d860",
          500: "#e0a82e",
          600: "#c78f1e",
        },
        solana: {
          purple: "#8a33f5",
          purpleSoft: "#d1abf9",
          purpleDeep: "#6b21d9",
          green: "#14F195",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-archivo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
