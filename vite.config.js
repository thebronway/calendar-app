const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  build: {
    // This is the default, but we'll be explicit
    // It tells Vite to put the compiled client app into a 'dist' folder
    outDir: 'dist',
  },
});
