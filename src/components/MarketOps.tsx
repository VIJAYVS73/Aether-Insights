import React from 'react';
import { Target, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import type { MarketOpsData } from '../lib/flipkartData';

const defaultData: MarketOpsData = {
  topProductName: 'Electronics Leader',
<<<<<<< HEAD
  topProductPrice: '₹9,999.00',
=======
  topProductPrice: '$129.99',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
  topProductCategory: 'Electronics',
  totalProducts: 4,
  avgRating: 4.5,
  targetReachM: '2.4K',
  targetReachPct: 65,
  marketShare: [
    { name: 'Your Brand', share: 24, color: 'bg-blue-500' },
    { name: 'SwiftCart Pro', share: 31, color: 'bg-purple-500' },
    { name: 'MegaStore X', share: 18, color: 'bg-emerald-500' },
    { name: 'Others', share: 27, color: 'bg-slate-600' },
  ],
};

interface MarketOpsProps {
  data?: MarketOpsData;
  isLoading?: boolean;
}

export const MarketOps: React.FC<MarketOpsProps> = ({ data, isLoading = false }) => {
  const d = data ?? defaultData;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-transparent"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Market Expansion</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Top performing product: <span className="text-white font-semibold">{d.topProductName}</span> in{' '}
            <span className="text-blue-400">{d.topProductCategory}</span> at{' '}
            <span className="text-emerald-400 font-mono">{d.topProductPrice}</span>.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Target Reach</span>
              <span className="text-white font-bold">{d.targetReachM} Users</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.targetReachPct}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-blue-500"
              />
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all">
              Start Campaign
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-transparent"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Category Overview</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Monitoring <span className="text-white font-semibold">{d.totalProducts}</span> products with an average rating of{' '}
            <span className="text-amber-400 font-bold">{d.avgRating.toFixed(1)} ★</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Products</p>
              <p className="text-sm text-white font-bold">{d.totalProducts}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Rating</p>
              <p className="text-sm text-emerald-400 font-bold">{d.avgRating.toFixed(1)} / 5</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold text-white mb-6">Market Share Distribution</h3>
        {isLoading && <p className="text-xs text-slate-400 mb-4">Updating from live data…</p>}
        <div className="space-y-6">
          {d.marketShare.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium">{item.name}</span>
                <span className="text-slate-400 font-mono">{item.share}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.share}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
