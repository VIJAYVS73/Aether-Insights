import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.BACKEND_PORT || 8787);
const isProdFlag = process.argv.includes('--production');
const isDev = process.env.NODE_ENV !== 'production' && !isProdFlag;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('*', (_, res) => {
  res.status(204).end();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'unified-rapidapi-backend' });
});

app.get('/api/market/products', async (_req: Request, res: Response) => {
  try {
    const upstream = await fetch('https://dummyjson.com/products?limit=100');
    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Failed to fetch from DummyJSON',
        details: payload,
      });
    }

    return res.json(payload);
  } catch (error) {
    console.error('Fetching real-time products failed:', error);
    return res.status(502).json({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
async function startServer() {
  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/health') {
        next();
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Unified app running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
