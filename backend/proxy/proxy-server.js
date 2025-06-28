const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: 'http://auth-service:5003',
    changeOrigin: true,
  }),
);

app.use(
  '/api/quiz',
  createProxyMiddleware({
    target: 'http://quiz-service:5000',
    changeOrigin: true,
  }),
);

app.use(
  '/api/tag',
  createProxyMiddleware({
    target: 'http://quiz-service:5000',
    changeOrigin: true,
  }),
);

app.use(
  '/api/session',
  createProxyMiddleware({
    target: 'http://quiz-service:5000',
    changeOrigin: true,
  }),
);

app.use(
  '/api/category',
  createProxyMiddleware({
    target: 'http://quiz-service:5000',
    changeOrigin: true,
  }),
);

app.use(
  '/api/question',
  createProxyMiddleware({
    target: 'http://quiz-service:5000',
    changeOrigin: true,
  }),
);

app.use(
  '/api/stats',
  createProxyMiddleware({
    target: 'http://stats-service:5001',
    changeOrigin: true,
  }),
);

app.use(
  '/api/user',
  createProxyMiddleware({
    target: 'http://user-service:5002',
    changeOrigin: true,
  }),
);

app.use(
  '/api/admin',
  createProxyMiddleware({
    target: 'http://user-service:5002',
    changeOrigin: true,
  }),
);

app.use(
  '/api/password',
  createProxyMiddleware({
    target: 'http://user-service:5002',
    changeOrigin: true,
  }),
);

app.use((err, req, res, next) => {
  console.error('Proxy error:', err);
  res.status(502).json({ message: 'Proxy error', error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});