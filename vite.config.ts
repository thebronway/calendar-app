import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vite compiles the React app into a 'dist' folder
    outDir: 'dist',
  },
  server: {
    proxy: {
      // Forward all /api requests to the Express backend in dev
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Forward WebSocket connections to the Express/ws backend in dev
      '/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
