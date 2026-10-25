import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// During development, requests to /api are forwarded to the FastAPI server
// (default http://localhost:8000), so the backend needs no CORS setup.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.BACKEND_ORIGIN || 'http://localhost:8000';
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: backend, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: false,
    },
  };
});
