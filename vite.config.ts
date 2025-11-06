import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/proxy-api': {
        target: 'http://108.60.201.12/WebApiLicitacionesCaasim',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/proxy-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to Target:', req.method, req.url, '-> Target:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Response from Target:', proxyRes.statusCode, 'for', req.url);
          });
        },
      }
    }
  }
})
