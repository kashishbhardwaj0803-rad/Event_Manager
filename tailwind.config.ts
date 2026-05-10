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
        surface: {
          0: "#0d0d0f",
          1: "#131315",
          2: "#1a1a1e",
          3: "#22222a",
          4: "#2a2a35",
        },
        primary: {
          DEFAULT: "#ADC6FF",
          dim: "rgba(173, 198, 255, 0.15)",
        },
        "accent-teal": "#64FFDA",
        "accent-amber": "#FFD166",
        "accent-red": "#FF4D6D",
        "accent-green": "#4ADE80",
        "error": "#FFB4AB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        "20": "20px",
        "24": "24px",
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
