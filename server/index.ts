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

app.get('/api/amazon/product-details', async (req: Request, res: Response) => {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.AMAZON_RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';
  const asin = String(req.query.asin || process.env.AMAZON_DEFAULT_ASIN || 'B07ZPKBL9V');
  const country = String(req.query.country || process.env.AMAZON_DEFAULT_COUNTRY || 'US');

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing RAPIDAPI_KEY in environment.',
    });
  }

  const url = `https://${host}/product-details?asin=${encodeURIComponent(asin)}&country=${encodeURIComponent(country)}`;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json',
      },
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'RapidAPI request failed',
        details: payload,
      });
    }

    return res.json(payload);
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach RapidAPI endpoint',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/flipkart/sub-categories', async (req: Request, res: Response) => {
  const apiKey = process.env.RAPIDAPI_KEY;
  const flipkartHost = process.env.FLIPKART_RAPIDAPI_HOST || 'real-time-flipkart-data2.p.rapidapi.com';
  const amazonHost = process.env.AMAZON_RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';
  const categoryId = String(req.query.categoryId || process.env.VITE_FLIPKART_CATEGORY_ID || 'clo');

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing RAPIDAPI_KEY in environment.',
    });
  }

  const flipkartUrl = `https://${flipkartHost}/sub-categories?categoryId=${encodeURIComponent(categoryId)}`;

  try {
    const upstream = await fetch(flipkartUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': flipkartHost,
        'Content-Type': 'application/json',
      },
    });

    const payload = await upstream.json().catch(() => ({}));

    if (upstream.ok) {
      return res.json(payload);
    }

    // Flipkart may be unavailable for some RapidAPI plans; fallback to Amazon data so UI still has live API data.
    const fallbackAsin = process.env.AMAZON_DEFAULT_ASIN || 'B07ZPKBL9V';
    const fallbackCountry = process.env.AMAZON_DEFAULT_COUNTRY || 'US';
    const amazonUrl = `https://${amazonHost}/product-details?asin=${encodeURIComponent(fallbackAsin)}&country=${encodeURIComponent(fallbackCountry)}`;

    const amazonResponse = await fetch(amazonUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': amazonHost,
        'Content-Type': 'application/json',
      },
    });

    const amazonPayload = await amazonResponse.json().catch(() => ({}));
    if (!amazonResponse.ok) {
      return res.status(upstream.status).json({
        error: 'RapidAPI request failed',
        details: payload,
      });
    }

    const amazonData =
      amazonPayload && typeof amazonPayload === 'object'
        ? (amazonPayload as Record<string, unknown>).data
        : null;

    return res.json({
      source: 'amazon-fallback',
      data: [
        {
          name:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_title === 'string'
              ? (amazonData as Record<string, unknown>).product_title
              : 'Amazon Product',
          categoryName:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).country === 'string'
              ? `Amazon ${(amazonData as Record<string, unknown>).country as string}`
              : 'Amazon',
          price:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_price === 'string'
              ? (amazonData as Record<string, unknown>).product_price
              : '$199.99',
          rating:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_star_rating === 'string'
              ? (amazonData as Record<string, unknown>).product_star_rating
              : '4.3',
          productCount:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_num_ratings === 'number'
              ? (amazonData as Record<string, unknown>).product_num_ratings
              : 850,
          imageUrl:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_photo === 'string'
              ? (amazonData as Record<string, unknown>).product_photo
              : 'https://picsum.photos/seed/amazon-fallback/40/40',
          url:
            amazonData && typeof amazonData === 'object' && typeof (amazonData as Record<string, unknown>).product_url === 'string'
              ? (amazonData as Record<string, unknown>).product_url
              : 'https://www.amazon.com',
        },
      ],
      flipkartError: payload,
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach RapidAPI endpoint',
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
