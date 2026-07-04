import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        boame: {
          deep: "#2E7D32",
          green: "#4CAF50",
          light: "#81C784",
          gold: "#FFD700",
          ink: "#1B1B1B",
          soft: "#F5F5F5",
          urgent: "#FF6B6B"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(27, 27, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
