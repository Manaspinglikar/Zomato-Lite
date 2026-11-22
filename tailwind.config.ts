import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f5ef",
        ink: "#211f1b",
        muted: "#756e64",
        line: "#e4dfd5",
        accent: "#a64f2f",
        "accent-soft": "#f6ece5",
        highlight: "#fbf5ee",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Palatino",
          "Georgia",
          "serif",
        ],
      },
      maxWidth: {
        content: "560px",
      },
      borderRadius: {
        card: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
