/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0a0a0a",
        surface: "#111111",
        card:    "#161616",
        border:  "#222222",
        purple:  "#7F77DD",
        teal:    "#1D9E75",
        amber:   "#BA7517",
        red:     "#E24B4A",
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}