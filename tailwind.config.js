/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}", "./anime_op_quiz_starter.jsx"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#0f1419",
        "dark-surface": "#1a1f2e",
        "dark-card": "#252d3d"
      }
    }
  },
  plugins: []
};
