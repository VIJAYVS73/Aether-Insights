import React from 'react';
import { TrendingUp, MapPin, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

export interface ProductDemandInfo {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  marketShare: string;
  imageUrl: string;
  demandLevel?: 'Critical' | 'High' | 'Medium';
  demandPercentage?: number;
}

interface HighDemandProductsProps {
  products: ProductDemandInfo[];
}

export const HighDemandProducts: React.FC<HighDemandProductsProps> = ({ products }) => {
  // Filter and sort by demand (reviews = proxy for demand)
  const highDemandProducts = [...products]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 6)
    .map((product, idx) => {
      const maxReviews = Math.max(...products.map(p => p.reviews));
      const demandPercentage = Math.round((product.reviews / (maxReviews || 1)) * 100);
      
      let demandLevel: 'Critical' | 'High' | 'Medium' = 'Medium';
      if (demandPercentage >= 80) {
        demandLevel = 'Critical';
      } else if (demandPercentage >= 50) {
        demandLevel = 'High';
      }
      
      return { ...product, demandLevel, demandPercentage };
    });

  const getDemandColor = (level: 'Critical' | 'High' | 'Medium') => {
    switch (level) {
      case 'Critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/50';
      case 'High':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      case 'Medium':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    }
  };

  const getDemandBadgeColor = (level: 'Critical' | 'High' | 'Medium') => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            High Demand Products Map
          </h2>
          <p className="text-slate-400 text-sm mt-1">Products with highest market demand</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs text-red-400">Critical</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-xs text-orange-400">High</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-xs text-yellow-400">Medium</span>
          </div>
        </div>
      </div>

      {/* Demand Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highDemandProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm p-4 transition-all hover:scale-105 hover:shadow-xl ${getDemandColor(
              product.demandLevel
            )}`}
          >
            {/* Demand indicator bar */}
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full" />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-white/10"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400">{product.category}</p>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getDemandBadgeColor(
                  product.demandLevel
                )}`}
              >
                {product.demandLevel}
              </div>
            </div>

            {/* Demand progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">Market Demand</span>
                <span className="text-xs font-semibold text-blue-400">{product.demandPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${product.demandPercentage}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"
                />
              </div>
            </div>

            {/* Product info */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs text-slate-400">Price</p>
                <p className="text-sm font-semibold text-white">{product.price}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs text-slate-400">Rating</p>
                <p className="text-sm font-semibold text-yellow-400">⭐ {product.rating}</p>
              </div>
            </div>

            {/* Reviews and market share */}
            <div className="flex items-center justify-between text-xs border-t border-white/10 pt-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                <span>{product.reviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span>{product.marketShare}</span>
              </div>
            </div>

            {/* Animated corner accent */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="text-center">
          <p className="text-slate-400 text-xs mb-1">Total Demand</p>
          <p className="text-2xl font-bold text-white">
            {highDemandProducts.reduce((sum, p) => sum + p.reviews, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Reviews</p>
        </div>
        <div className="text-center border-l border-r border-white/10">
          <p className="text-slate-400 text-xs mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-yellow-400">
            {(highDemandProducts.reduce((sum, p) => sum + p.rating, 0) / highDemandProducts.length).toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Stars</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs mb-1">Combined Share</p>
          <p className="text-2xl font-bold text-blue-400">
            {highDemandProducts.reduce((sum, p) => sum + parseFloat(p.marketShare), 0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Market</p>
        </div>
      </div>
    </div>
  );
};
