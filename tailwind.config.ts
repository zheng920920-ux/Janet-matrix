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
        matrix: {
          ink: "#18211f",
          muted: "#5f6966",
          paper: "#f5f7f2",
          panel: "#ffffff",
          line: "#dfe5dc",
          green: "#087f5b",
          red: "#c2410c",
          amber: "#b7791f",
          blue: "#2563eb",
          violet: "#6d28d9",
        },
      },
      boxShadow: {
        soft: "0 10px 28px rgba(24, 33, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
