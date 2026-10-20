import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        night: "#07111d",
        panel: "#0d1a28",
        cyanline: "#38e8ff"
      },
      boxShadow: {
        glow: "0 0 35px rgba(56, 232, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
