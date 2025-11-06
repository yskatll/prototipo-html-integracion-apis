import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Proxy para la API
app.use('/api', createProxyMiddleware({
  target: 'http://108.60.201.12/WebApiLicitacionesCaasim',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remueve /api del path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxy request: ${req.method} ${req.url} -> http://108.60.201.12/WebApiLicitacionesCaasim${req.url.replace('/api', '')}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response: ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.log('Proxy error:', err);
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Redirecting /api/* to http://108.60.201.12/WebApiLicitacionesCaasim/*`);
});