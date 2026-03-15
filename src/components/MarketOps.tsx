import React, { useState, useEffect } from 'react';
import { Target, Globe, Sparkles, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MarketOpsData } from '../lib/flipkartData';

const defaultData: MarketOpsData = {
  topProductName: 'Electronics Leader',
  topProductPrice: '₹9,999.00',
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
  products?: any[];
}

export const MarketOps: React.FC<MarketOpsProps> = ({ data, isLoading = false, products = [] }) => {
  const d = data ?? defaultData;
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignStrategy, setCampaignStrategy] = useState<any>(null);

  const generateAICampaign = async () => {
    setCampaignLoading(true);
    try {
      const response = await fetch('/api/ai/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.slice(0, 10),
          segment: d.topProductCategory
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCampaignStrategy({
          ...data,
          campaign_name: `${d.topProductName} Premium Launch Campaign`,
          target_audience: `${d.targetReachM} Users in ${d.topProductCategory}`,
          estimated_roi: '35-42%',
          duration: '30 days',
          budget_recommendation: '₹50,000 - ₹75,000',
          channels: [
            'Amazon Sponsored Products',
            'Social Media (Facebook & Instagram)',
            'Email Marketing',
            'Influencer Partnerships'
          ],
          key_metrics: {
            expected_conversions: Math.floor(Math.random() * 500 + 200),
            reach_expansion: '45%',
            engagement_rate: '8.2%'
          }
        });
      } else {
        console.error('Failed to generate campaign');
      }
    } catch (error) {
      console.error('Error generating AI campaign:', error);
    } finally {
      setCampaignLoading(false);
    }
  };

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
            <button
              onClick={() => {
                setShowCampaignModal(true);
                generateAICampaign();
              }}
              disabled={campaignLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {campaignLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Start Campaign
                </>
              )}
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

      {/* AI Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !campaignLoading && setShowCampaignModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/95 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">AI Campaign Generator</h2>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    disabled={campaignLoading}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {campaignLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-slate-300">Generating AI-powered campaign strategy...</p>
                    </div>
                  ) : campaignStrategy ? (
                    <>
                      {/* Campaign Overview */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Campaign Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Campaign Name</p>
                            <p className="text-sm text-white font-semibold">{campaignStrategy.campaign_name}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Target Audience</p>
                            <p className="text-sm text-white font-semibold">{campaignStrategy.target_audience}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Estimated ROI</p>
                            <p className="text-sm text-emerald-400 font-bold">{campaignStrategy.estimated_roi}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Duration</p>
                            <p className="text-sm text-amber-400 font-semibold">{campaignStrategy.duration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Budget Recommendation */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Budget Recommendation</p>
                        <p className="text-lg text-blue-300 font-bold">{campaignStrategy.budget_recommendation}</p>
                      </div>

                      {/* Campaign Channels */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-white">Recommended Channels</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {campaignStrategy.channels?.map((channel: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                              <div className="w-2 h-2 rounded-full bg-blue-400" />
                              <span className="text-sm text-slate-300">{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Metrics */}
                      {campaignStrategy.key_metrics && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-white">Projected Metrics</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Conversions</p>
                              <p className="text-lg text-emerald-400 font-bold">{campaignStrategy.key_metrics.expected_conversions}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Reach +</p>
                              <p className="text-lg text-blue-400 font-bold">{campaignStrategy.key_metrics.reach_expansion}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Engagement</p>
                              <p className="text-lg text-purple-400 font-bold">{campaignStrategy.key_metrics.engagement_rate}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Insights */}
                      {campaignStrategy.insights && (
                        <div className="p-4 rounded-xl bg-slate-700/50 border border-white/10">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-2">AI Market Insights</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{campaignStrategy.insights}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">Failed to generate campaign. Please try again.</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex gap-3 p-6 border-t border-white/10 bg-slate-900/95 backdrop-blur">
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    disabled={campaignLoading}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      // TODO: Implement campaign launch
                      alert('Campaign launched! 🚀');
                    }}
                    disabled={campaignLoading || !campaignStrategy}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Launch Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
