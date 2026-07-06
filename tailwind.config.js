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
        'theme-panel': 'var(--theme-panel-bg)',
        'theme-text': 'var(--theme-text-primary)',
        'theme-accent': 'rgb(var(--theme-accent-rgb) / <alpha-value>)',
        'theme-accent-text': 'var(--theme-accent-text)',
        'theme-accent-secondary': 'rgb(var(--theme-accent-secondary-rgb) / <alpha-value>)',
        'theme-item': 'var(--theme-item-bg)',
        'theme-item-hover': 'var(--theme-item-hover)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Add line-clamp plugin
    require('@tailwindcss/typography'), // Add typography for markdown
  ],
};
