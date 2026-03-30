import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/tab4u': {
        target: 'https://www.tab4u.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/tab4u/, ''),
      },
    },
  },
});
