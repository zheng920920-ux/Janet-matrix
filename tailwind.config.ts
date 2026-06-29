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
          ink: "#111827",
          muted: "#6B7280",
          paper: "#F7F8FA",
          panel: "#ffffff",
          line: "#E5E7EB",
          green: "#16A34A",
          red: "#DC2626",
          amber: "#F59E0B",
          blue: "#6B7280",
          violet: "#6B7280",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 24, 39, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
