import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/service3': {
        target: 'https://gateway.icespyonline.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/service3/, '/service3'),
        headers: {
          'Origin': 'https://dash.icespyonline.com'
        },
        cookieDomainRewrite: {
          '.icespyonline.com': ''
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
});