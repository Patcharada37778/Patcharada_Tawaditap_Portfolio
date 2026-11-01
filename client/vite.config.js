import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, forward API and upload requests to the Node server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
