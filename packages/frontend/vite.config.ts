import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://maine--alb16-kxi3dpqk8uzt-480421270.us-east-1.elb.amazonaws.com',
        changeOrigin: true,
      },
    },
  },
});
