/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in the src folder
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Add line-clamp plugin
  ],
};
