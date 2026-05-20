import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2320",
        surface: "#FFFFFF",
        canvas: "#F7F4EE",
        muted: "#E8E3DA",
        primary: "#1F6F68",
        primaryDark: "#174F4A",
        sage: "#6F8674",
        wine: "#8B3A62",
        gold: "#B9874C",
        info: "#2A7AB5",
        success: "#2F7D55",
        warning: "#B7791F",
        danger: "#C2413B",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(31, 35, 32, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
