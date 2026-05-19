import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20181f",
        wine: "#5b143b",
        plum: "#3a1638",
        sand: "#f8f4ed",
        sage: "#6f8674",
        gold: "#b9874c",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(32, 24, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
