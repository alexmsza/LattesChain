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
          900: "rgb(var(--navy-900) / <alpha-value>)",
          800: "rgb(var(--navy-800) / <alpha-value>)",
          700: "rgb(var(--navy-700) / <alpha-value>)",
          600: "rgb(var(--navy-600) / <alpha-value>)",
        },
        gold: {
          400: "#f6d860",
          500: "#e0a82e",
          600: "#c78f1e",
        },
        solana: {
          purple: "rgb(var(--solana-purple) / <alpha-value>)",
          purpleSoft: "rgb(var(--solana-purple-soft) / <alpha-value>)",
          purpleDeep: "rgb(var(--solana-purple-deep) / <alpha-value>)",
          green: "rgb(var(--solana-green) / <alpha-value>)",
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
