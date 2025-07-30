/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        foreground: "#ffffff",
        primary: "#1DB954",
        secondary: "#535353",
        accent: "#282828",
        muted: "#333333",
        "muted-foreground": "#888888",
        "ring": "#1DB954",
        "ring-foreground": "#1DB954",
        border: "#333333",
      },
    },
  },
  plugins: [],
}; 