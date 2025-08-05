/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "meteo-title": "#131d5c",
        "meteo-morning": "#c59556",
        "meteo-afternoon": "#c1fa06",
        "meteo-evening": "#da2121",
        "meteo-blue": "#2d93aa",
      },
      fontFamily: {
        sans: ["Franklin Gothic Medium", "Arial Narrow", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
