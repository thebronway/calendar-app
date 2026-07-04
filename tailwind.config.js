/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in the src folder
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        'theme-base': 'var(--theme-bg)',
        'theme-accent': 'var(--theme-accent)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Add line-clamp plugin
    require('@tailwindcss/typography'), // Add typography for markdown
  ],
};
