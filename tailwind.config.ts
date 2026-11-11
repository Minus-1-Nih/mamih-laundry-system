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
        primary: {
          DEFAULT: "#2A6F56", // Sage Green
          hover: "#225945",
          light: "#39886b",
        },
        secondary: {
          DEFAULT: "#E8F3EE", // Soft Sage
          hover: "#d9ebe2",
          dark: "#bcdacb",
        },
        brand: {
          bg: "#FAF9F6", // Off-White
          text: "#1E2421", // Deep Charcoal
        },
      },
    },
  },
  plugins: [],
};

export default config;
