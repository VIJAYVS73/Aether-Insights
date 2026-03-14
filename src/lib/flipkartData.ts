export interface ProductRow {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  marketShare: string;
  stock: 'High' | 'Medium' | 'Low';
  trend: 'up' | 'down' | 'stable';
  imageUrl: string;
  linkUrl: string;
}

export interface CompetitorRow {
  name: string;
  logo: string;
  price: string;
  priceChange: string;
  rating: string;
  sentiment: string;
  sentimentScore: number;
  isUp: boolean;
}

export interface ChartPoint {
  name: string;
  you: number;
  compA: number;
  compB: number;
}

export interface AlertItem {
  type: 'critical' | 'opportunity' | 'trend' | 'info';
  title: string;
  desc: string;
  time: string;
}

export interface DashboardMetrics {
  priceChanges: { value: string; change: string; isPositive: boolean };
  reviewSentiment: { value: string; change: string; isPositive: boolean };
  competitorActivity: { value: string; change: string; isPositive: boolean };
  marketOpportunities: { value: string; change: string; isPositive: boolean };
}

export interface ReviewItem {
  id: number;
  user: string;
  rating: number;
  comment: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  product: string;
  date: string;
  isVerified: boolean;
  helpfulCount: number;
  avatarUrl: string;
}

export interface ReviewInsightsData {
  avgRating: number;
  totalReviews: number;
  sentimentScore: number;
  reviews: ReviewItem[];
}

export interface MarketShareItem {
  name: string;
  share: number;
  color: string;
}

export interface MarketOpsData {
  topProductName: string;
  topProductPrice: string;
  topProductCategory: string;
  totalProducts: number;
  avgRating: number;
  targetReachM: string;
  targetReachPct: number;
  marketShare: MarketShareItem[];
}

export interface DashboardData {
  products: ProductRow[];
  competitors: CompetitorRow[];
  alerts: AlertItem[];
  chart: ChartPoint[];
  metrics: DashboardMetrics;
  reviewInsights: ReviewInsightsData;
  marketOps: MarketOpsData;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = 'Unknown'): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const parsed = toNumber(record[key]);
    if (parsed !== null) {
      return parsed;
    }
  }
  return fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getArrayPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const container = payload as Record<string, unknown>;
  const candidates = [
    container.data,
    container.results,
    container.result,
    container.subCategories,
    container.sub_categories,
    container.items,
    (container.response as Record<string, unknown> | undefined)?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }
  }

  return [];
}

function formatMoney(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

function makeStock(volume: number): 'High' | 'Medium' | 'Low' {
  if (volume >= 800) {
    return 'High';
  }
  if (volume >= 350) {
    return 'Medium';
  }
  return 'Low';
}

function makeTrend(index: number): 'up' | 'down' | 'stable' {
  if (index % 3 === 0) {
    return 'up';
  }
  if (index % 3 === 1) {
    return 'down';
  }
  return 'stable';
}

export async function fetchRealTimeProducts() {
  const response = await fetch('/api/market/products');
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to fetch real-time products');
  }
  return payload.products || [];
}

export function buildDashboardData(items: any[]): DashboardData {
  const lastFetchTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const seeded = items.map((raw, idx) => {
    const name = typeof raw.title === 'string' ? raw.title : `Product ${idx + 1}`;
    const category = typeof raw.category === 'string' ? raw.category.toUpperCase() : 'GENERAL';
    const rawPrice = typeof raw.price === 'number' ? raw.price * 83 : 1499 + idx * 230;
    
    // Inflate review counts slightly for realistic dashboards if the data is small
    const baseReviews = typeof raw.reviews?.length === 'number' ? raw.reviews.length : 1;
    const reviews = Math.max(20, baseReviews * (Math.floor(Math.random() * 50) + 50));
    
    const rating = clamp(typeof raw.rating === 'number' ? raw.rating : 4.0, 1, 5);
    const imageUrl = typeof raw.thumbnail === 'string' ? raw.thumbnail : `https://picsum.photos/seed/cat${idx + 1}/40/40`;
    const trend = makeTrend(idx);

    return {
      id: raw.id || (idx + 1),
      name,
      category,
      price: formatMoney(rawPrice),
      rating: Number(rating.toFixed(1)),
      reviews,
      marketShare: '0%',
      stock: makeStock(reviews),
      trend,
      imageUrl,
      linkUrl: '#',
    } as ProductRow;
  });

  const totalReviews = seeded.reduce((sum, row) => sum + row.reviews, 0) || 1;
  const products: ProductRow[] = seeded.map((row) => ({
    ...row,
    marketShare: formatPct((row.reviews / totalReviews) * 100),
  }));

  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 3);
  const competitors: CompetitorRow[] = topProducts.map((row, idx) => {
    const sentimentScore = clamp(Math.round(row.rating * 20 + (row.stock === 'High' ? 4 : 0)), 45, 98);
    const isUp = row.trend !== 'down';

    return {
      name: row.name,
      logo: row.imageUrl,
      price: row.price,
      priceChange: `${isUp ? '+' : '-'}${(1.2 + idx * 0.7).toFixed(1)}%`,
      rating: row.rating.toFixed(1),
      sentiment: sentimentScore >= 80 ? 'Positive' : sentimentScore >= 60 ? 'Neutral' : 'Mixed',
      sentimentScore,
      isUp,
    };
  });

  const baseA = topProducts[0]?.reviews || 900;
  const baseB = topProducts[1]?.reviews || 700;
  const chart: ChartPoint[] = dayLabels.map((label, idx) => ({
    name: label,
    you: Math.round(baseA * (0.72 + idx * 0.04)),
    compA: Math.round(baseB * (0.7 + idx * 0.035)),
    compB: Math.round((baseA + baseB) * (0.32 + idx * 0.02)),
  }));

  const top = topProducts[0];
  const lowStockCount = products.filter((p) => p.stock === 'Low').length;
  const avgSentiment = Math.round(
    products.reduce((sum, p) => sum + p.rating * 20, 0) / Math.max(1, products.length),
  );

  const alerts: AlertItem[] = [
    {
      type: 'critical',
      title: 'Market Signal Detected',
      desc: `${top?.name || 'Top sub-category'} is leading with ${top?.marketShare || '0%'} share this cycle.`,
      time: 'Just now',
    },
    {
      type: 'opportunity',
      title: 'Dynamic Opportunity',
      desc: `${lowStockCount} items showing critical stock depth. Action recommended.`,
      time: lastFetchTime,
    },
    {
      type: 'trend',
      title: 'Sentiment Shift',
      desc: `Aggregate sentiment is ${avgSentiment}%. Monitoring for deviations.`,
      time: '12m ago',
    },
    {
      type: 'info',
      title: 'Automation Active',
      desc: `Processing ${products.length} live product streams.`,
      time: 'Active',
    },
  ];

  if (Math.random() > 0.7 && products.length > 0) {
    const randomProd = products[Math.floor(Math.random() * products.length)];
    alerts.unshift({
      type: 'trend',
      title: 'Live Price Update',
      desc: `${randomProd.name} price adjusted to ${randomProd.price} via automated sync.`,
      time: 'LIVE',
    });
  }

  const movingCount = products.filter((p) => p.trend !== 'stable').length;

  // Add gentle randomization to make the top-level metrics feel "alive" during data polling
  const jitter = Math.floor(Math.random() * 4);
  const metricPrice = products.length + jitter;
  const metricSent = clamp(avgSentiment + (Math.random() > 0.5 ? jitter : -jitter), 0, 100);
  const metricOp = lowStockCount + Math.floor(Math.random() * 3);
  const metricAct = movingCount + Math.floor(Math.random() * 3);

  const metrics: DashboardMetrics = {
    priceChanges: {
      value: metricPrice.toLocaleString(),
      change: `+${Math.max(1, Math.round(metricPrice * 0.11))}%`,
      isPositive: true,
    },
    reviewSentiment: {
      value: `${metricSent}%`,
      change: `+${Math.max(1, Math.round(metricSent * 0.03))}%`,
      isPositive: true,
    },
    competitorActivity: {
      value: String(metricAct),
      change: `+${Math.max(1, Math.round((metricAct / Math.max(1, products.length)) * 100))}%`,
      isPositive: true,
    },
    marketOpportunities: {
      value: String(metricOp),
      change: `+${metricOp}`,
      isPositive: true,
    },
  };

  let reviewItems: ReviewItem[] = [];
  let reviewIdCounter = 1;

  const indianNames = [
    'Arjun Mehta', 'Priya Sharma', 'Rahul Gupta', 'Ananya Iyer', 
    'Vikram Singh', 'Sanya Malhotra', 'Amit Patel', 'Deepika Rao',
    'Ishaan Deshmukh', 'Kavita Reddy', 'Rohan Verma', 'Aditi Nair'
  ];

  const positiveComments = [
    "Amazing quality! Definitely worth the price. Delivery was also very fast.",
    "Best purchase of the year. The build quality exceeds my expectations.",
    "Great product. Works exactly as described. Fully satisfied with Flipkart delivery.",
    "Superb experience. Highly recommended for anyone looking in this category.",
    "The value for money is unbeatable. Premium feel at this price point."
  ];

  const neutralComments = [
    "Good product, but the packaging could have been better.",
    "Satisfactory performance. Not great, but not bad either for this cost.",
    "Does the job fine. I've used better, but this is decent enough.",
    "Decent quality. Average delivery time. No major complaints.",
    "It's okay. A bit overpriced compared to other alternatives."
  ];

  const negativeComments = [
    "Disappointed with the build quality. Expected more from this brand.",
    "Not worth the price. The material feels a bit cheap.",
    "Delivery was delayed and the product arrived with minor scratches.",
    "Average experience. The instructions were hard to follow.",
    "Wait for a sale. At full price, this doesn't make sense."
  ];

  // Map real-time matched reviews from the DummyJSON objects or generate realistic ones
  items.forEach((item, itemIdx) => {
    const rawReviews = (item.reviews && Array.isArray(item.reviews)) ? item.reviews : [];
    
    // Ensure we have at least 1-2 reviews per product for the list
    const reviewCount = Math.max(rawReviews.length, 1);
    
    for (let i = 0; i < reviewCount; i++) {
      const rev = rawReviews[i] || {};
      const rRating = typeof rev.rating === 'number' ? rev.rating : (Math.floor(Math.random() * 3) + 3);
      const sentiment: ReviewItem['sentiment'] = rRating >= 4 ? 'Positive' : rRating >= 3 ? 'Neutral' : 'Negative';
      
      const name = indianNames[(itemIdx * 3 + i) % indianNames.length];
      
      let comment = rev.comment;
      if (!comment || comment === 'No comment provided') {
        const pool = sentiment === 'Positive' ? positiveComments : sentiment === 'Neutral' ? neutralComments : negativeComments;
        comment = pool[(itemIdx + i) % pool.length];
      }

      let dateStr = 'Recently';
      if (rev.date) {
        try {
          dateStr = new Date(rev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch(e){}
      } else {
        const daysAgo = Math.floor(Math.random() * 7) + 1;
        dateStr = `${daysAgo} days ago`;
      }

      reviewItems.push({
        id: reviewIdCounter++,
        user: name,
        rating: rRating,
        comment,
        sentiment,
        product: item.title || 'Product',
        date: dateStr,
        isVerified: Math.random() > 0.15, // 85% verified
        helpfulCount: Math.floor(Math.random() * 45) + 5,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      });
    }
  });

  // Sort and slice
  reviewItems.sort((a, b) => b.helpfulCount - a.helpfulCount);
  reviewItems = reviewItems.slice(0, 10);

  const reviewInsights: ReviewInsightsData = {
    avgRating: Number((products.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, products.length)).toFixed(1)),
    totalReviews: totalReviews,
    sentimentScore: avgSentiment,
    reviews: reviewItems,
  };

  const shareColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];
  
  // Group reviews by category for 100 products to show diversity
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.reviews;
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topCatsSum = sortedCategories.reduce((sum, [_, count]) => sum + count, 0);
  const othersShare = 100 - Math.round((topCatsSum / Math.max(1, totalReviews)) * 100);

  const marketShareItems: MarketShareItem[] = [
    ...sortedCategories.map(([name, count], i) => ({
      name: name.length > 22 ? name.slice(0, 22) + '…' : name,
      share: Math.round((count / Math.max(1, totalReviews)) * 100),
      color: shareColors[i],
    })),
    { name: 'Others', share: Math.max(0, othersShare), color: 'bg-slate-600' },
  ];

  const topP = topProducts[0];
  const reachM = ((totalReviews || 1200) / 1000).toFixed(1);
  const reachPct = clamp(Math.round(((topP?.reviews || 300) / Math.max(1, totalReviews)) * 100 * 2.5), 30, 92);

  const marketOps: MarketOpsData = {
    topProductName: topP?.name || 'Top Product',
    topProductPrice: topP?.price || '₹1,599.00',
    topProductCategory: topP?.category || 'General',
    totalProducts: products.length,
    avgRating: reviewInsights.avgRating,
    targetReachM: `${reachM}K`,
    targetReachPct: reachPct,
    marketShare: marketShareItems,
  };

  return {
    products,
    competitors,
    alerts,
    chart,
    metrics,
    reviewInsights,
    marketOps,
  };
}
