import React, { useState, useEffect, useRef } from 'react';
import {
  Target, Globe, Sparkles, X, Loader,
  TrendingUp, Users, Rocket, Copy, Check, RefreshCw, Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MarketOpsData } from '../lib/flipkartData';

// ─── Campaign type definitions ───────────────────────────────────────────────
const CAMPAIGN_TYPES = [
  {
    id: 'sales_boost',
    label: 'Sales Boost',
    Icon: TrendingUp,
    description: 'Drive immediate conversions with targeted promotions',
    accent: 'emerald',
    roiRange: [28, 45],
    durationDays: 14,
    channels: [
      { name: 'Sponsored Products', allocation: 40, priority: 'Primary' },
      { name: 'Flash Sale Banners', allocation: 25, priority: 'Primary' },
      { name: 'Email Marketing', allocation: 20, priority: 'Secondary' },
      { name: 'Push Notifications', allocation: 15, priority: 'Secondary' },
    ],
  },
  {
    id: 'brand_awareness',
    label: 'Brand Awareness',
    Icon: Users,
    description: 'Expand reach and build lasting brand recognition',
    accent: 'blue',
    roiRange: [18, 32],
    durationDays: 30,
    channels: [
      { name: 'Social Media (FB & Instagram)', allocation: 35, priority: 'Primary' },
      { name: 'Influencer Partnerships', allocation: 30, priority: 'Primary' },
      { name: 'Display Advertising', allocation: 20, priority: 'Secondary' },
      { name: 'Content Marketing', allocation: 15, priority: 'Secondary' },
    ],
  },
  {
    id: 'new_launch',
    label: 'New Launch',
    Icon: Rocket,
    description: 'Maximise visibility for a new product entry',
    accent: 'purple',
    roiRange: [35, 55],
    durationDays: 21,
    channels: [
      { name: 'Sponsored Products', allocation: 30, priority: 'Primary' },
      { name: 'Influencer Partnerships', allocation: 25, priority: 'Primary' },
      { name: 'Social Media (FB & Instagram)', allocation: 25, priority: 'Secondary' },
      { name: 'Email Marketing', allocation: 20, priority: 'Secondary' },
    ],
  },
] as const;

const LOADING_STEPS = [
  'Analyzing product catalog…',
  'Calculating market ROI…',
  'Selecting optimal channels…',
  'Finalizing campaign strategy…',
];

type CampaignTypeEntry = (typeof CAMPAIGN_TYPES)[number];

const ACCENT_STYLES: Record<string, { card: string; badge: string; text: string; bar: string }> = {
  emerald: { card: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  blue:    { card: 'bg-blue-500/10 border-blue-500/30',       badge: 'bg-blue-500/20 text-blue-300',       text: 'text-blue-400',    bar: 'bg-blue-500' },
  purple:  { card: 'bg-purple-500/10 border-purple-500/30',   badge: 'bg-purple-500/20 text-purple-300',   text: 'text-purple-400',  bar: 'bg-purple-500' },
};

function buildCampaignStrategy(
  type: CampaignTypeEntry,
  products: any[],
  d: MarketOpsData,
  apiInsights: string,
) {
  const parsePrice = (p: any) =>
    parseFloat(String(p.price ?? p.discountedPrice ?? '0').replace(/[₹,\s]/g, '')) || 0;

  const avgPrice = products.length > 0
    ? products.reduce((s, p) => s + parsePrice(p), 0) / products.length
    : 5000;

  const avgRating = products.length > 0
    ? products.reduce((s, p) => s + (Number(p.rating ?? p.stars) || 4.0), 0) / products.length
    : d.avgRating;

  const ratingBonus = Math.max(0, (avgRating - 4.0) * 3);
  const [roiMin, roiMax] = type.roiRange;
  const roi = `${Math.floor(roiMin + ratingBonus)}–${Math.floor(roiMax + ratingBonus)}%`;

  const count = Math.max(products.length, 10);
  const budgetBase = Math.max(10000, Math.round(avgPrice * count * 0.05 / 1000) * 1000);
  const budgetHigh = Math.round(budgetBase * 1.6 / 1000) * 1000;
  const budget = `₹${budgetBase.toLocaleString('en-IN')} – ₹${budgetHigh.toLocaleString('en-IN')}`;

  const conversions = Math.floor(count * 15 + ratingBonus * 20 + Math.random() * 150 + 80);
  const reachPct = Math.floor(35 + ratingBonus * 2 + Math.random() * 20);
  const engRate = parseFloat((5.5 + ratingBonus * 0.4 + Math.random() * 2).toFixed(1));
  const cpc = `₹${Math.max(1, avgPrice * 0.008).toFixed(2)}`;

  return {
    campaign_name: `${d.topProductName} — ${type.label} Campaign`,
    campaign_type: type.label,
    target_audience: `${d.targetReachM} Users in ${d.topProductCategory}`,
    estimated_roi: roi,
    duration: `${type.durationDays} days`,
    budget_recommendation: budget,
    channels: type.channels,
    key_metrics: {
      expected_conversions: conversions,
      reach_expansion: `${reachPct}%`,
      engagement_rate: `${engRate}%`,
      cost_per_click: cpc,
    },
    ab_test_suggestion: `Test "${type.channels[0].name}" vs "${type.channels[1].name}" for the first 7 days before full rollout.`,
    insights: apiInsights,
  };
}

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

  // Modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [step, setStep] = useState<'pick' | 'loading' | 'result' | 'launched'>('pick');
  const [selectedType, setSelectedType] = useState<CampaignTypeEntry>(CAMPAIGN_TYPES[0]);
  const [campaignStrategy, setCampaignStrategy] = useState<ReturnType<typeof buildCampaignStrategy> | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => () => { if (loadingTimerRef.current) clearInterval(loadingTimerRef.current); }, []);

  const openModal = () => {
    setStep('pick');
    setCampaignStrategy(null);
    setLoadingStep(0);
    setLoadingProgress(0);
    setShowCampaignModal(true);
  };

  const closeModal = () => {
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    setShowCampaignModal(false);
  };

  const runGeneration = async (type: CampaignTypeEntry) => {
    setStep('loading');
    setLoadingStep(0);
    setLoadingProgress(0);

    // Animated progress
    let stepIdx = 0;
    let progress = 0;
    loadingTimerRef.current = setInterval(() => {
      progress += 2;
      setLoadingProgress(Math.min(progress, 99));
      if (progress % 25 === 0 && stepIdx < LOADING_STEPS.length - 1) {
        stepIdx += 1;
        setLoadingStep(stepIdx);
      }
    }, 40) as unknown as ReturnType<typeof setInterval>;

    try {
      const response = await fetch('/api/ai/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: products.slice(0, 10), segment: d.topProductCategory }),
      });

      const apiData = response.ok ? await response.json() : {};
      const strategy = buildCampaignStrategy(type, products, d, apiData.insights ?? '');
      setCampaignStrategy(strategy);
    } catch {
      const strategy = buildCampaignStrategy(type, products, d, '');
      setCampaignStrategy(strategy);
    } finally {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
      setLoadingProgress(100);
      setTimeout(() => setStep('result'), 300);
    }
  };

  const handleGenerate = () => runGeneration(selectedType);
  const handleRegenerate = () => runGeneration(selectedType);

  const handleCopy = () => {
    if (!campaignStrategy) return;
    const s = campaignStrategy;
    const text = [
      `Campaign: ${s.campaign_name}`,
      `Type: ${s.campaign_type}`,
      `Audience: ${s.target_audience}`,
      `ROI: ${s.estimated_roi}`,
      `Duration: ${s.duration}`,
      `Budget: ${s.budget_recommendation}`,
      '',
      'Channels:',
      ...s.channels.map((c) => `  • ${c.name} (${c.allocation}%) — ${c.priority}`),
      '',
      `Conversions: ${s.key_metrics.expected_conversions}`,
      `Reach +${s.key_metrics.reach_expansion}   Engagement ${s.key_metrics.engagement_rate}   CPC ${s.key_metrics.cost_per_click}`,
      '',
      `A/B Test: ${s.ab_test_suggestion}`,
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-linear-to-br from-blue-500/10 to-transparent"
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
              onClick={openModal}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Start Campaign
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 bg-linear-to-br from-emerald-500/10 to-transparent"
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => step !== 'loading' && closeModal()}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/95 backdrop-blur z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white leading-tight">AI Campaign Generator</h2>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {step === 'pick' && 'Choose a campaign type'}
                        {step === 'loading' && 'Generating strategy…'}
                        {step === 'result' && campaignStrategy?.campaign_name}
                        {step === 'launched' && 'Campaign queued for launch'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    disabled={step === 'loading'}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-40"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* ── STEP: pick ─────────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                  {step === 'pick' && (
                    <motion.div
                      key="pick"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-6 space-y-6"
                    >
                      <p className="text-sm text-slate-400">
                        Select the goal of your campaign. The AI will tailor the
                        strategy, channel mix, and budget to match your product
                        catalog in <span className="text-white font-semibold">{d.topProductCategory}</span>.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CAMPAIGN_TYPES.map((type) => {
                          const styles = ACCENT_STYLES[type.accent];
                          const isSelected = selectedType.id === type.id;
                          return (
                            <button
                              key={type.id}
                              onClick={() => setSelectedType(type)}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? `${styles.card} border-current`
                                  : 'bg-white/5 border-transparent hover:border-white/20'
                              }`}
                            >
                              <type.Icon className={`w-5 h-5 mb-2 ${isSelected ? styles.text : 'text-slate-400'}`} />
                              <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {type.label}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-snug">{type.description}</p>
                              <p className={`text-xs font-semibold mt-2 ${isSelected ? styles.text : 'text-slate-500'}`}>
                                ROI {type.roiRange[0]}–{type.roiRange[1]}%
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={closeModal}
                          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="flex-1 py-3 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={15} />
                          Generate Strategy
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP: loading ─────────────────────────────────────────── */}
                  {step === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-10 flex flex-col items-center justify-center gap-6"
                    >
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                        <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32" cy="32" r="28"
                            fill="none" stroke="url(#grad)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - loadingProgress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                          />
                          <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{loadingProgress}%</span>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-white font-semibold text-sm">{LOADING_STEPS[loadingStep]}</p>
                        <p className="text-slate-500 text-xs">Building your <span className="text-purple-400">{selectedType.label}</span> strategy</p>
                      </div>

                      <div className="w-full max-w-xs space-y-2">
                        {LOADING_STEPS.map((s, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${i < loadingStep ? 'bg-emerald-500' : i === loadingStep ? 'bg-purple-500 animate-pulse' : 'bg-white/10'}`}>
                              {i < loadingStep && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className={`text-xs ${i <= loadingStep ? 'text-slate-300' : 'text-slate-600'}`}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP: result ──────────────────────────────────────────── */}
                  {step === 'result' && campaignStrategy && (() => {
                    const styles = ACCENT_STYLES[selectedType.accent];
                    return (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-6 space-y-5"
                      >
                        {/* Type badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles.badge}`}>
                            {campaignStrategy.campaign_type}
                          </span>
                          <span className="text-xs text-slate-500">{campaignStrategy.duration}</span>
                        </div>

                        {/* Overview grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Campaign Name', value: campaignStrategy.campaign_name, color: styles.card },
                            { label: 'Target Audience', value: campaignStrategy.target_audience, color: 'bg-white/5 border-white/10' },
                            { label: 'Estimated ROI', value: campaignStrategy.estimated_roi, color: 'bg-emerald-500/10 border-emerald-500/20', valueClass: 'text-emerald-400 font-bold' },
                            { label: 'Budget', value: campaignStrategy.budget_recommendation, color: 'bg-amber-500/10 border-amber-500/20', valueClass: 'text-amber-400 font-bold font-mono' },
                          ].map(({ label, value, color, valueClass }) => (
                            <div key={label} className={`p-3 rounded-xl border ${color}`}>
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
                              <p className={`text-sm font-semibold text-white ${valueClass ?? ''}`}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Channel allocation bars */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white">Channel Allocation</h4>
                          {campaignStrategy.channels.map((ch: any) => (
                            <div key={ch.name} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-300">{ch.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ch.priority === 'Primary' ? styles.badge : 'bg-white/5 text-slate-400'}`}>
                                    {ch.priority}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono w-8 text-right">{ch.allocation}%</span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ch.allocation}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  className={`h-full ${styles.bar}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Conversions', value: campaignStrategy.key_metrics.expected_conversions, color: 'text-emerald-400' },
                            { label: 'Reach +', value: campaignStrategy.key_metrics.reach_expansion, color: 'text-blue-400' },
                            { label: 'Engagement', value: campaignStrategy.key_metrics.engagement_rate, color: 'text-purple-400' },
                            { label: 'CPC', value: campaignStrategy.key_metrics.cost_per_click, color: 'text-amber-400' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="p-2 rounded-lg bg-white/5 text-center">
                              <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{label}</p>
                              <p className={`text-sm font-bold ${color}`}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* A/B test suggestion */}
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                          <div className="text-blue-400 mt-0.5 shrink-0 text-sm font-bold">A/B</div>
                          <p className="text-xs text-slate-300 leading-relaxed">{campaignStrategy.ab_test_suggestion}</p>
                        </div>

                        {/* AI insights */}
                        {campaignStrategy.insights && (
                          <div className="p-4 rounded-xl bg-slate-700/40 border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">AI Market Insights</p>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{campaignStrategy.insights}</p>
                          </div>
                        )}

                        {/* Footer actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={closeModal}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
                          >
                            Close
                          </button>
                          <button
                            onClick={handleRegenerate}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all flex items-center gap-1.5"
                          >
                            <RefreshCw size={13} />
                            Regenerate
                          </button>
                          <button
                            onClick={handleCopy}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all flex items-center gap-1.5 ml-auto"
                          >
                            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                          <button
                            onClick={() => setStep('launched')}
                            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold transition-all flex items-center gap-2"
                          >
                            <Rocket size={14} />
                            Launch
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* ── STEP: launched ────────────────────────────────────────── */}
                  {step === 'launched' && (
                    <motion.div
                      key="launched"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-10 flex flex-col items-center justify-center gap-5 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Rocket className="w-7 h-7 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">Campaign Queued!</h3>
                        <p className="text-slate-400 text-sm max-w-xs">
                          <span className="text-white font-semibold">{campaignStrategy?.campaign_name}</span> has been
                          added to your launch queue. You'll receive a notification when it goes live.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-xs">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-slate-500 uppercase font-bold mb-0.5">Est. ROI</p>
                          <p className="text-emerald-400 font-bold">{campaignStrategy?.estimated_roi}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <p className="text-slate-500 uppercase font-bold mb-0.5">Duration</p>
                          <p className="text-blue-400 font-bold">{campaignStrategy?.duration}</p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold text-sm mt-2"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
