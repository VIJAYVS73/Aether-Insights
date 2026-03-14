import React from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReviewInsightsData } from '../lib/flipkartData';

const defaultData: ReviewInsightsData = {
  avgRating: 4.6,
  totalReviews: 12402,
  sentimentScore: 84,
  reviews: [
    { 
      id: 1, 
      user: 'Sarah J.', 
      rating: 5, 
      comment: 'The battery life on these headphones is incredible.', 
      sentiment: 'Positive', 
      product: 'Ultra-Bass Wireless', 
      date: '2 days ago', 
      isVerified: true, 
      helpfulCount: 24, 
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' 
    },
    { 
      id: 2, 
      user: 'Michael R.', 
      rating: 2, 
      comment: 'Sound quality is good but uncomfortable for long sessions.', 
      sentiment: 'Negative', 
      product: 'Ultra-Bass Wireless', 
      date: '4 days ago', 
      isVerified: true, 
      helpfulCount: 12, 
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' 
    },
    { 
      id: 3, 
      user: 'Emily W.', 
      rating: 4, 
      comment: 'Great value. Noise cancellation is decent for the price.', 
      sentiment: 'Positive', 
      product: 'Smart-Fit Tracker', 
      date: '1 week ago', 
      isVerified: false, 
      helpfulCount: 45, 
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' 
    },
  ],
};

interface ReviewInsightsProps {
  data?: ReviewInsightsData;
  isLoading?: boolean;
}

export const ReviewInsights: React.FC<ReviewInsightsProps> = ({ data, isLoading = false }) => {
  const d = data ?? defaultData;
  const reviews = d.reviews;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold text-white">{d.avgRating.toFixed(1)}</h3>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(d.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              ))}
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-bold">{isLoading ? 'Loading…' : 'Live from API'}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1">Total Reviews</p>
          <h3 className="text-3xl font-bold text-white">{d.totalReviews.toLocaleString()}</h3>
          <p className="text-xs text-blue-400 mt-2 font-bold">{reviews.length} shown below</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-1">Sentiment Score</p>
          <h3 className="text-3xl font-bold text-white">{d.sentimentScore}%</h3>
          <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${d.sentimentScore}%` }} />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-6">Recent Customer Feedback</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                    <img 
                      src={review.avatarUrl} 
                      alt={review.user} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{review.user}</p>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          VERIFIED
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">{review.date} • {review.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{review.comment}"</p>
              <div className="mt-4 flex items-center gap-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  review.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                  review.sentiment === 'Neutral' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {review.sentiment}
                </span>
                <div className="flex items-center gap-3 ml-auto">
                  <button className="text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                    <ThumbsUp className="w-3.5 h-3.5 group-hover:fill-emerald-400/20" />
                    <span className="text-[10px] font-bold">{review.helpfulCount} Helpful</span>
                  </button>
                  <button className="text-slate-500 hover:text-red-400 transition-colors">
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
