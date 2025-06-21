import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        cormorant: ["var(--font-cormorant)"],
        oldforge: ["var(--font-oldforge)"],
        parochus: ["var(--font-parochus)"],
        "parochus-original": ["var(--font-parochus-original)"],
      },
      colors: {
        primary: "#1E293B", // A dark slate blue, you can change this
        secondary: "#D4AF37", // A gold color, you can change this
      },
    },
  },
  plugins: [],
};
export default config; 