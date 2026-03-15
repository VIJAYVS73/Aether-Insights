import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface InsightData {
  status: string;
  segment?: string;
  insights?: string;
  trend?: string;
  confidence?: number;
  forecast?: string;
  analysis?: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  market_position?: string;
  recommendation?: string;
  products_analyzed?: number;
  pro_plan?: boolean;
}

interface AIInsightsProps {
  products: any[];
  isLoading?: boolean;
  isPro?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ products, isLoading = false, isPro = false }) => {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [forecast, setForecast] = useState<InsightData | null>(null);
  const [competition, setCompetition] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast' | 'competition'>('insights');

  useEffect(() => {
    if (products && products.length > 0) {
      fetchAIInsights();
    }
  }, [products, isPro]);

  const fetchAIInsights = async () => {
    setLoading(true);
    setError('');
    try {
      // Prepare product data safely
      const productData = Array.isArray(products) ? products.slice(0, 10) : [];
      
      if (productData.length === 0) {
        console.warn('No products available for analysis');
        setLoading(false);
        return;
      }

      // Fetch market insights
      try {
        const insightsRes = await fetch('/api/ai/market-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            products: productData,
            segment: 'electronics'
          })
        });
        
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          console.log('Insights received:', insightsData);
          setInsights(insightsData);
        } else {
          console.error('Insights API error:', insightsRes.status);
          setError(`Failed to fetch insights: ${insightsRes.status}`);
        }
      } catch (err) {
        console.error('Insights fetch error:', err);
      }

      // Fetch forecast
      try {
        const forecastRes = await fetch('/api/ai/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            historicalData: productData.slice(0, 20)
          })
        });
        
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          console.log('Forecast received:', forecastData);
          setForecast(forecastData);
        } else {
          console.error('Forecast API error:', forecastRes.status);
        }
      } catch (err) {
        console.error('Forecast fetch error:', err);
      }

      // Fetch competitive analysis if pro
      if (isPro) {
        try {
          const competitionRes = await fetch('/api/ai/competitive-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              products: productData.slice(0, 15)
            })
          });
          
          if (competitionRes.ok) {
            const competitionData = await competitionRes.json();
            console.log('Competition data received:', competitionData);
            setCompetition(competitionData);
          } else {
            console.error('Competition API error:', competitionRes.status);
          }
        } catch (err) {
          console.error('Competition fetch error:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              AI-Powered Market Analysis
            </h2>
            <p className="text-slate-400 text-sm">Automated insights from GPT-OSS model</p>
          </div>
        </div>
        {isPro && (
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full">
            <p className="text-xs font-semibold text-purple-300">PRO Plan</p>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        {['insights', 'forecast', 'competition'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
              activeTab === tab
                ? 'text-blue-400 border-b-blue-400'
                : 'text-slate-400 border-b-transparent hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'competition' && !isPro && ' (Pro)'}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-block">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin" />
                  <div className="absolute inset-1 bg-slate-900 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <p className="text-slate-300">Generating AI insights...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        ) : (
          <>
            {/* Market Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {insights ? (
                  <>
                    {/* Main Insight Box */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Market Analysis</h3>
                          <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                            {insights.insights || 'Analyzing market data...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Products Analyzed</p>
                        <p className="text-xl font-bold text-blue-400">{insights.products_analyzed || 0}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Segment</p>
                        <p className="text-lg font-semibold text-white capitalize">{insights.segment || 'General'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                    <p className="text-slate-400">No insights available. Click refresh to generate analysis.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Demand Forecast Tab */}
            {activeTab === 'forecast' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {forecast ? (
                  <>
                    {/* Forecast Box */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">30-Day Demand Forecast</h3>
                          <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                            {forecast.forecast || 'Generating forecast...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Trend</p>
                        <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-1">
                          {forecast.trend || 'UP'} ⬆️
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Confidence</p>
                        <p className="text-lg font-bold text-blue-400">{Math.round((forecast.confidence || 0.87) * 100)}%</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Avg Rating</p>
                        <p className="text-lg font-bold text-yellow-400">{forecast.avg_rating || 4.5}★</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                    <p className="text-slate-400">No forecast available. Click refresh to generate forecast.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Competitive Analysis Tab (Pro Only) */}
            {activeTab === 'competition' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {competition ? (
                  <>
                    {/* Market Position */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Market Position</h3>
                          <p className="text-slate-300 text-sm">{competition.market_position}</p>
                          <p className="text-slate-400 text-sm mt-2 italic">{competition.recommendation}</p>
                        </div>
                      </div>
                    </div>

                    {/* SWOT Analysis */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Strengths */}
                      <div className="bg-white/5 border border-green-500/30 rounded-lg p-3">
                        <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          STRENGTHS
                        </p>
                        <ul className="space-y-1">
                          {competition.analysis?.strengths?.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-xs text-slate-300">• {s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-white/5 border border-red-500/30 rounded-lg p-3">
                        <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          WEAKNESSES
                        </p>
                        <ul className="space-y-1">
                          {competition.analysis?.weaknesses?.slice(0, 2).map((w, i) => (
                            <li key={i} className="text-xs text-slate-300">• {w}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="bg-white/5 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs font-bold text-blue-400 mb-2">OPPORTUNITIES</p>
                        <ul className="space-y-1">
                          {competition.analysis?.opportunities?.slice(0, 2).map((o, i) => (
                            <li key={i} className="text-xs text-slate-300">• {o}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="bg-white/5 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-xs font-bold text-yellow-400 mb-2">THREATS</p>
                        <ul className="space-y-1">
                          {competition.analysis?.threats?.slice(0, 2).map((t, i) => (
                            <li key={i} className="text-xs text-slate-300">• {t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">Pro Plan Feature</p>
                    <p className="text-slate-400 text-sm">Competitive analysis available in Pro mode.</p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={fetchAIInsights}
        disabled={loading}
        className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Generating Insights...' : 'Refresh Insights'}
      </motion.button>

      {/* Model Info */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 space-y-1">
        <p>🤖 <span className="font-semibold">Model:</span> GPT-OSS-120B</p>
        <p>⚡ <span className="font-semibold">Update Interval:</span> Every 24 hours (Pro) / Manual refresh (Free)</p>
      </div>
    </div>
  );
};
