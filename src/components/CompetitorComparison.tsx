import React from 'react';
import { Star, DollarSign, MessageCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { CompetitorRow } from '../lib/flipkartData';

const defaultCompetitors: CompetitorRow[] = [
  {
    name: 'SwiftCart Pro',
    logo: 'https://picsum.photos/seed/comp1/40/40',
<<<<<<< HEAD
    price: '₹9,999.00',
=======
    price: '$129.99',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    priceChange: '+4.2%',
    rating: '4.2',
    sentiment: 'Positive',
    sentimentScore: 78,
    isUp: true
  },
  {
    name: 'MegaStore X',
    logo: 'https://picsum.photos/seed/comp2/40/40',
<<<<<<< HEAD
    price: '₹8,499.00',
=======
    price: '$115.50',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    priceChange: '-2.1%',
    rating: '3.9',
    sentiment: 'Neutral',
    sentimentScore: 52,
    isUp: false
  },
  {
    name: 'Elite Goods',
    logo: 'https://picsum.photos/seed/comp3/40/40',
<<<<<<< HEAD
    price: '₹11,999.00',
=======
    price: '$145.00',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    priceChange: '+0.5%',
    rating: '4.8',
    sentiment: 'Very Positive',
    sentimentScore: 94,
    isUp: true
  }
];

interface CompetitorComparisonProps {
  competitors?: CompetitorRow[];
  isLoading?: boolean;
}

export const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({
  competitors,
  isLoading = false,
}) => {
  const cardData = competitors && competitors.length ? competitors : defaultCompetitors;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cardData.map((comp, idx) => (
        <motion.div 
          key={comp.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card glass-card-hover p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <img src={comp.logo} alt={comp.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
            <div>
              <h4 className="text-white font-bold">{comp.name}</h4>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Direct Competitor</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Price</span>
              </div>
              <div className="text-right">
                <p className="text-white font-mono font-bold">{comp.price}</p>
                <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${comp.isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {comp.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {comp.priceChange}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold">{comp.rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Sentiment</span>
                </div>
                <span className="text-xs font-bold text-blue-400">{comp.sentiment}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${comp.sentimentScore}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      </div>
      {isLoading && (
        <p className="text-xs text-slate-400">Syncing competitor cards from live Flipkart categories...</p>
      )}
    </div>
  );
};
