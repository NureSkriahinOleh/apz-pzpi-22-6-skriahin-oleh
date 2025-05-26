import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/v1/, '/api/v1'),
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    }
  }
});