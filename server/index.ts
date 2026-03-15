import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { generateText, getAIStatus, type AIProvider } from './ai.js';

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

// Geolocation-based product demand endpoint (GeoClip-inspired)
app.post('/api/geo/location-products', express.json(), async (req: Request, res: Response) => {
  try {
    const { lat, lng, city, region, country } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing coordinates (lat, lng required)',
      });
    }

    // Location-based product mapping (simulating GeoClip encoding)
    const locationProductMap: Record<string, any[]> = {
      // US Tech Hubs
      'Mountain View,California,US': [
        { name: 'iPhone 14', category: 'Mobiles', demand: 85, icon: 'smartphone' },
        { name: 'MacBook Pro', category: 'Laptops', demand: 72, icon: 'laptop' },
        { name: 'Apple Watch', category: 'Accessories', demand: 68, icon: 'watch' },
      ],
      '37.4056,-122.0775': [
        { name: 'iPhone 14', category: 'Mobiles', demand: 85, icon: 'smartphone' },
        { name: 'MacBook Pro', category: 'Laptops', demand: 72, icon: 'laptop' },
        { name: 'Apple Watch', category: 'Accessories', demand: 68, icon: 'watch' },
      ],
      // New York
      'New York,New York,US': [
        { name: 'Samsung Galaxy S23', category: 'Mobiles', demand: 78, icon: 'smartphone' },
        { name: 'Dell Laptop', category: 'Laptops', demand: 65, icon: 'laptop' },
        { name: 'Sony Headphones', category: 'Accessories', demand: 72, icon: 'headphones' },
      ],
      // Los Angeles
      'Los Angeles,California,US': [
        { name: 'OnePlus 11', category: 'Mobiles', demand: 68, icon: 'smartphone' },
        { name: 'Canon Camera', category: 'Cameras', demand: 75, icon: 'camera' },
        { name: 'Nike Shoes', category: 'Fashion', demand: 82, icon: 'shoes' },
      ],
      // India
      'Mumbai,Maharashtra,IN': [
        { name: 'Redmi Note 13', category: 'Mobiles', demand: 88, icon: 'smartphone' },
        { name: 'Dell Inspiron', category: 'Laptops', demand: 70, icon: 'laptop' },
        { name: 'Boat Earbuds', category: 'Accessories', demand: 85, icon: 'headphones' },
      ],
      'Bangalore,Karnataka,IN': [
        { name: 'OnePlus 11', category: 'Mobiles', demand: 80, icon: 'smartphone' },
        { name: 'HP Laptop', category: 'Laptops', demand: 72, icon: 'laptop' },
        { name: 'Smart Watch', category: 'Accessories', demand: 70, icon: 'watch' },
      ],
      'Delhi,Delhi,IN': [
        { name: 'Realme Narzo', category: 'Mobiles', demand: 75, icon: 'smartphone' },
        { name: 'Lenovo ThinkPad', category: 'Laptops', demand: 68, icon: 'laptop' },
        { name: 'JBL Speaker', category: 'Accessories', demand: 78, icon: 'speaker' },
      ],
      // UK
      'London,England,UK': [
        { name: 'iPhone 14', category: 'Mobiles', demand: 82, icon: 'smartphone' },
        { name: 'Sony Headphones', category: 'Accessories', demand: 76, icon: 'headphones' },
        { name: 'Adidas Backpack', category: 'Fashion', demand: 71, icon: 'backpack' },
      ],
      // Japan
      'Tokyo,Tokyo,JP': [
        { name: 'Sony Headphones', category: 'Accessories', demand: 88, icon: 'headphones' },
        { name: 'Canon Camera', category: 'Cameras', demand: 85, icon: 'camera' },
        { name: 'Smart Watch', category: 'Accessories', demand: 79, icon: 'watch' },
      ],
    };

    // Try exact location match, then region match, then country match
    let locationKey = `${city},${region},${country}`;
    let products = locationProductMap[locationKey];

    if (!products) {
      locationKey = `${lat},${lng}`;
      products = locationProductMap[locationKey];
    }

    if (!products) {
      // Fallback: generate based on country
      const countryProducts: Record<string, any[]> = {
        US: [
          { name: 'iPhone 14', category: 'Mobiles', demand: 80, icon: 'smartphone' },
          { name: 'Dell Laptop', category: 'Laptops', demand: 68, icon: 'laptop' },
        ],
        IN: [
          { name: 'Redmi Note 13', category: 'Mobiles', demand: 85, icon: 'smartphone' },
          { name: 'Boat Earbuds', category: 'Accessories', demand: 82, icon: 'headphones' },
        ],
        UK: [
          { name: 'iPhone 14', category: 'Mobiles', demand: 80, icon: 'smartphone' },
          { name: 'Sony Headphones', category: 'Accessories', demand: 75, icon: 'headphones' },
        ],
        JP: [
          { name: 'Sony Headphones', category: 'Accessories', demand: 86, icon: 'headphones' },
          { name: 'Canon Camera', category: 'Cameras', demand: 84, icon: 'camera' },
        ],
      };

      products = countryProducts[country] || [
        { name: 'Samsung Galaxy S23', category: 'Mobiles', demand: 75, icon: 'smartphone' },
        { name: 'MegaLaptop Pro', category: 'Laptops', demand: 70, icon: 'laptop' },
      ];
    }

    res.json({
      location: {
        city,
        region,
        country,
        coordinates: { lat, lng },
      },
      products: products.map((p) => ({
        ...p,
        imageUrl: `https://picsum.photos/seed/${p.icon}demand/40/40`,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Location-based product query failed:', error);
    return res.status(500).json({
      error: 'Failed to process location-based query',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// AI-Powered Geolocation Demand Surge Alerts
app.post('/api/geo/demand-surge-alerts', express.json(), async (req: Request, res: Response) => {
  try {
    const { city, region, country, products, lat, lng } = req.body;

    if (!city || !region || !country) {
      return res.status(400).json({
        error: 'Missing location data (city, region, country required)'
      });
    }

    console.log(`Generating AI demand surge alerts for ${city}, ${region}, ${country}`);

    // Generate AI-powered alert message based on location and products
    const productList = Array.isArray(products) ? products.slice(0, 5) : [];
    const productNames = productList.map((p: any) => p.name || p.title).join(', ');
    
    const demandContext = {
      location: `${city}, ${region}, ${country}`,
      products: productNames,
      surge_percentage: Math.floor(Math.random() * 60) + 20,
      market_condition: ['bullish', 'strong', 'explosive'][Math.floor(Math.random() * 3)] as string
    };

    let alertMessage: string;
    let marketInsight: string;
    let provider = 'mock';

    try {
      const alertPrompt = `You are a market intelligence AI. Write a brief, urgent demand surge alert (2-3 sentences) for ${city}, ${region} showing a ${demandContext.surge_percentage}% demand surge. Top trending products: ${productNames || 'electronics and accessories'}. Market condition: ${demandContext.market_condition}. Be specific and actionable. No preamble.`;
      const insightPrompt = `In exactly 1 sentence, describe the purchasing trends and consumer behavior in ${city}, ${region} for the ${productList[0]?.category || 'electronics'} category during a ${demandContext.market_condition} market period.`;
      const [alertRes, insightRes] = await Promise.all([
        generateText(alertPrompt),
        generateText(insightPrompt),
      ]);
      alertMessage = alertRes.text;
      marketInsight = insightRes.text;
      provider = alertRes.provider;
    } catch {
      alertMessage = `📍 ${city}, ${region} is experiencing a ${demandContext.surge_percentage}% demand surge! Top products: ${productNames || 'Multiple categories'} are trending heavily. ${demandContext.market_condition === 'explosive' ? '🔥 CRITICAL OPPORTUNITY - Act fast!' : demandContext.market_condition === 'strong' ? '⚡ High-opportunity market' : '📈 Growing demand'}`;
      marketInsight = `The ${city} market is showing strong purchasing power with focus on ${productList[0]?.category || 'electronics'} category. Regional preferences indicate ${demandContext.market_condition} market conditions.`;
    }

    // Generate AI alert using the Python script
    const aiAlert = {
      surge_title: `${demandContext.market_condition.charAt(0).toUpperCase() + demandContext.market_condition.slice(1)} Demand Surge in ${city}`,
      alert_message: alertMessage,
      recommendations: [
        `Increase inventory for top selling items in ${city}`,
        `Launch targeted marketing campaign in ${region}`,
        `Offer flash sales on high-demand products`,
        `Optimize logistics for faster delivery to ${city} area`
      ],
      market_insight: marketInsight,
      provider,
      alert_severity: demandContext.surge_percentage > 50 ? 'critical' : demandContext.surge_percentage > 30 ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log(`AI alert generated for ${city}: ${aiAlert.surge_title}`);

    res.json({
      status: 'success',
      city,
      region,  
      country,
      coordinates: { lat, lng },
      alert: aiAlert,
      products: productList.slice(0, 3).map((p: any) => ({
        name: p.name || p.title,
        category: p.category,
        demand: p.demand || Math.floor(Math.random() * 40) + 60,
        icon: p.icon || 'package'
      }))
    });
  } catch (error) {
    console.error('Demand surge alert generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate demand surge alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check with AI status
app.get('/api/ai/status', async (_req: Request, res: Response) => {
  const status = await getAIStatus();
  res.json({
    status: 'ready',
    ...status,
    ai_models: ['market-insights', 'forecast', 'competitive-analysis'],
    version: '2.0.0',
  });
});

// AI Market Analysis Endpoint
app.post('/api/ai/market-insights', express.json(), async (req: Request, res: Response) => {
  try {
    const { products, segment = 'general' } = req.body;

    console.log('Market insights request received:', { productsCount: Array.isArray(products) ? products.length : 0, segment });

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid products data' });
    }

    let insights: string;
    let provider: AIProvider = 'mock';

    const topProducts = products.slice(0, 5).map((p: any) =>
      `- ${p.title || p.name} | Price: ${p.price || 'N/A'} | Rating: ${p.rating || p.stars || 'N/A'} | Reviews: ${p.reviews || p.count || 0}`
    ).join('\n');
    const prompt = `You are an expert e-commerce market analyst. Analyze these ${segment} products and provide a concise market insight report in exactly 4 numbered points:\n\nProducts:\n${topProducts}\n\nProvide insights covering:\n1. Market Trends\n2. Key Opportunities\n3. Competitive Advantages\n4. Actionable Recommendations\n\nKeep each point to 1-2 sentences. Be specific and data-driven. Do not include any preamble.`;

    try {
      const result = await generateText(prompt);
      insights = result.text;
      provider = result.provider;
    } catch {
      insights = `Market Analysis for ${segment}:\n\n1. Market Trends: Strong demand in premium segments with 35% YoY growth\n2. Opportunities: Emerging markets show untapped potential in value segment\n3. Competitive Advantages: Quality differentiation and customer loyalty programs key\n4. Recommendations: Focus on omnichannel strategy and subscription models`;
    }

    console.log(`Sending insights response (provider: ${provider})`);
    res.json({
      status: 'success',
      provider,
      segment,
      insights,
      products_analyzed: Math.min(products.length, 5),
      top_products: products.slice(0, 3).map((p: any) => ({
        title: p.title || p.name,
        reviews: p.reviews || p.count || 0,
        price: p.price,
        rating: p.rating || p.stars || 4.5,
      })),
    });
  } catch (error) {
    console.error('Market insights generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate market insights',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// AI Demand Forecast Endpoint
app.post('/api/ai/forecast', express.json(), async (req: Request, res: Response) => {
  try {
    const { historicalData } = req.body;

    console.log('Forecast request received:', { dataCount: Array.isArray(historicalData) ? historicalData.length : 0 });

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return res.status(400).json({ error: 'Invalid historical data' });
    }

    const avgRating = (historicalData.reduce((sum: number, d: any) => sum + (d.rating || 4.5), 0) / historicalData.length).toFixed(2);
    const totalReviews = historicalData.reduce((sum: number, d: any) => sum + (d.reviews || d.count || 0), 0);
    const prices = historicalData.map((d: any) => d.price || 0).filter((p: number) => p > 0);
    const priceRange = prices.length > 0 ? `₹${Math.min(...prices)}-₹${Math.max(...prices)}` : 'N/A';

    let forecast: string;
    let provider: AIProvider = 'mock';

    const forecastPrompt = `You are a demand forecasting expert for e-commerce. Based on this product catalog data:\n- Total products: ${historicalData.length}\n- Average rating: ${avgRating}★\n- Total reviews: ${totalReviews}\n- Price range: ${priceRange}\n\nGenerate a 30-day demand forecast in exactly 4 numbered points covering:\n1. Predicted trend (include percentage estimate)\n2. Growth drivers\n3. Risk factors\n4. Overall outlook\n\nBe concise (1-2 sentences per point) and specific. Do not include any preamble.`;

    try {
      const result = await generateText(forecastPrompt);
      forecast = result.text;
      provider = result.provider;
    } catch {
      forecast = `30-Day Demand Forecast:\n\n1. Predicted Trend: UP ⬆️ (+12-15% expected)\n2. Growth Drivers: Seasonal demand peak + new feature releases\n3. Risk Factors: Supply chain delays, competitor launches\n4. Outlook: Strong bullish sentiment across all categories`;
    }

    console.log(`Sending forecast response (provider: ${provider})`);
    res.json({
      status: 'success',
      provider,
      forecast,
      avg_rating: parseFloat(avgRating),
      total_reviews: totalReviews,
      products_count: historicalData.length,
      trend: 'UP',
      confidence: 0.87,
    });
  } catch (error) {
    console.error('Demand forecast generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate forecast',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// AI Competitive Analysis Endpoint
app.post('/api/ai/competitive-analysis', express.json(), async (req: Request, res: Response) => {
  try {
    const { products, competitor } = req.body;

    if (!products) {
      return res.status(400).json({ error: 'Missing products data' });
    }

    let provider: AIProvider = 'mock';
    let strengths: string[];
    let weaknesses: string[];
    let opportunities: string[];
    let threats: string[];
    let market_position: string;
    let recommendation: string;

    const productList = Array.isArray(products) ? products.slice(0, 5).map((p: any) =>
      `${p.title || p.name} (₹${p.price || 'N/A'}, ${p.rating || 4.5}★)`
    ).join(', ') : 'various products';
    const caPrompt = `You are a competitive intelligence analyst. Analyze these products competing against ${competitor || 'the market average'}: ${productList}\n\nRespond with a JSON object only (no markdown, no explanation) with these exact keys:\n{\n  "strengths": ["point1","point2","point3","point4"],\n  "weaknesses": ["point1","point2","point3"],\n  "opportunities": ["point1","point2","point3","point4"],\n  "threats": ["point1","point2","point3"],\n  "market_position": "one sentence",\n  "recommendation": "one sentence"\n}`;

    try {
      const result = await generateText(caPrompt);
      provider = result.provider;
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        strengths = parsed.strengths ?? [];
        weaknesses = parsed.weaknesses ?? [];
        opportunities = parsed.opportunities ?? [];
        threats = parsed.threats ?? [];
        market_position = parsed.market_position ?? '';
        recommendation = parsed.recommendation ?? '';
      } else throw new Error('No JSON in response');
    } catch {
      provider = 'mock';
      strengths = weaknesses = opportunities = threats = [];
      market_position = recommendation = '';
    }

    if (provider === 'mock') {
      strengths = ['Superior product quality (4.7★ vs 4.2★ competitor avg)', 'Competitive pricing strategy', 'Strong customer retention (68% repeat rate)', 'Excellent post-sales support'];
      weaknesses = ['Limited SKU diversity', 'Geographic coverage gaps', 'Brand awareness lower in tier-2 cities'];
      opportunities = ['Expansion into underserved segments', 'Bundle offerings with complementary products', 'Direct-to-consumer channels', 'Loyalty program enhancements'];
      threats = ['New market entrants with aggressive pricing', 'Changing consumer preferences', 'Supply chain disruptions'];
      market_position = 'Strong #2 player with growth potential';
      recommendation = 'Focus on differentiation through innovation and customer experience';
    }

    res.json({
      status: 'success',
      provider,
      competitor_name: competitor || 'Market Average',
      analysis: { strengths, weaknesses, opportunities, threats },
      market_position,
      recommendation,
    });
  } catch (error) {
    console.error('Competitive analysis failed:', error);
    res.status(500).json({
      error: 'Failed to generate competitive analysis',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Pro Plan: Advanced AI insights
app.post('/api/ai/pro-insights', express.json(), async (req: Request, res: Response) => {
  try {
    const { products, analysis_type = 'full' } = req.body;

    let provider: AIProvider = 'mock';
    let recommendations = ['Increase inventory for top 3 SKUs', 'Launch promotional campaign for slow-moving items', 'Expand merchant network in high-demand regions'];
    let market_health = 'Bullish';
    let growth_potential = 'High (+18% projected)';
    let risk_score = 3.2;

    const proProductList = Array.isArray(products) ? products.slice(0, 5).map((p: any) =>
      `${p.title || p.name} (${p.rating || 4.5}★, ${p.reviews || 0} reviews)`
    ).join(', ') : 'various products';
    const proPrompt = `You are a senior market strategist. Perform a ${analysis_type} analysis for these products: ${proProductList}\n\nRespond with a JSON object only (no markdown, no explanation):\n{\n  "market_health": "Bullish|Neutral|Bearish",\n  "growth_potential": "one short phrase with % estimate",\n  "risk_score": <number 1-10>,\n  "recommendations": ["action1","action2","action3"]\n}`;

    try {
      const result = await generateText(proPrompt);
      provider = result.provider;
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        market_health = parsed.market_health ?? market_health;
        growth_potential = parsed.growth_potential ?? growth_potential;
        risk_score = parsed.risk_score ?? risk_score;
        recommendations = parsed.recommendations ?? recommendations;
      }
    } catch {
      provider = 'mock';
    }

    res.json({
      status: 'success',
      provider,
      pro_plan: true,
      analysis_type,
      timestamp: new Date().toISOString(),
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      insights: { market_health, growth_potential, risk_score, recommendations },
    });
  } catch (error) {
    console.error('Pro insights generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate pro insights',
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
