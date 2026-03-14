import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { MetricCard } from './components/MetricCard';
import { AnalyticsChart } from './components/AnalyticsChart';
import { CompetitorComparison } from './components/CompetitorComparison';
import { AlertsPanel } from './components/AlertsPanel';
import { DataTable } from './components/DataTable';
import { ReviewInsights } from './components/ReviewInsights';
import { MarketOps } from './components/MarketOps';
import { Settings as SettingsView } from './components/Settings';
import { AutomationConsole } from './components/AutomationConsole';
import {
  DollarSign,
  MessageCircle,
  Activity,
  Target,
  Download,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildDashboardData, fetchRealTimeProducts } from './lib/flipkartData';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMarketData = async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      setLoadError('');

      try {
        const items = await fetchRealTimeProducts();

        if (mounted) {
          setRawItems(items);
          if (!isBackground) setHasInitialLoaded(true);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to fetch market data.');
          if (!isBackground) setRawItems([]);
        }
      } finally {
        if (mounted && !isBackground) {
          setIsLoading(false);
        }
      }
    };

    if (!hasInitialLoaded) {
      loadMarketData();
    }

    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(() => {
        loadMarketData(true);
      }, 5000);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isLive, hasInitialLoaded]);

  const dashboardData = useMemo(() => buildDashboardData(rawItems), [rawItems]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Price Changes"
                value={dashboardData.metrics.priceChanges.value}
                change={dashboardData.metrics.priceChanges.change}
                isPositive={dashboardData.metrics.priceChanges.isPositive}
                icon={DollarSign}
                color="blue"
              />
              <MetricCard
                title="Review Sentiment"
                value={dashboardData.metrics.reviewSentiment.value}
                change={dashboardData.metrics.reviewSentiment.change}
                isPositive={dashboardData.metrics.reviewSentiment.isPositive}
                icon={MessageCircle}
                color="emerald"
              />
              <MetricCard
                title="Competitor Activity"
                value={dashboardData.metrics.competitorActivity.value}
                change={dashboardData.metrics.competitorActivity.change}
                isPositive={dashboardData.metrics.competitorActivity.isPositive}
                icon={Activity}
                color="purple"
              />
              <MetricCard
                title="Market Opportunities"
                value={dashboardData.metrics.marketOpportunities.value}
                change={dashboardData.metrics.marketOpportunities.change}
                isPositive={dashboardData.metrics.marketOpportunities.isPositive}
                icon={Target}
                color="amber"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Price Trend Analysis</h3>
                      <p className="text-xs text-slate-500">Comparing your brand vs top 3 competitors</p>
                    </div>
                  </div>
                  <AnalyticsChart series={dashboardData.chart} isLoading={isLoading} />
                </section>
                <section className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Competitor Product Matrix</h3>
                  <DataTable products={dashboardData.products} isLoading={isLoading} />
                </section>
              </div>
              <div className="space-y-8">
                <section className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Market Signals</h3>
                  <AlertsPanel alerts={dashboardData.alerts} isLoading={isLoading} />
                </section>
              </div>
            </div>
          </motion.div>
        );
      case 'Competitor Intel':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <CompetitorComparison competitors={dashboardData.competitors} isLoading={isLoading} />
            <section className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">Market Share Distribution</h3>
              <DataTable products={dashboardData.products} isLoading={isLoading} />
            </section>
          </motion.div>
        );
      case 'Price Monitoring':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <section className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">Historical Price Trends</h3>
              <AnalyticsChart series={dashboardData.chart} isLoading={isLoading} />
            </section>
            <DataTable products={dashboardData.products} isLoading={isLoading} />
          </motion.div>
        );
      case 'Review Insights':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ReviewInsights data={dashboardData.reviewInsights} isLoading={isLoading} />
          </motion.div>
        );
      case 'Market Ops':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MarketOps data={dashboardData.marketOps} isLoading={isLoading} />
          </motion.div>
        );
      case 'Alerts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <AlertsPanel alerts={dashboardData.alerts} isLoading={isLoading} />
          </motion.div>
        );
      case 'Settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SettingsView />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-dark">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0">
        <TopNav />

        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">{activeTab}</h1>
              <p className="text-slate-400 mt-1">
                {activeTab === 'Dashboard' ? 'Real-time competitive analysis and market signals.' :
                  activeTab === 'Settings' ? 'Manage your account and notification preferences.' :
                    `Detailed analysis and monitoring for ${activeTab.toLowerCase()}.`}
              </p>
              {loadError && (
                <p className="mt-2 text-xs text-amber-400">
                  {loadError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all ${
                  isLive 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
                {isLive ? 'Stop Live Stream' : 'Start Live Stream'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </button>
              <button 
                onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => setIsExporting(false), 3000);
                }}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  isExporting 
                    ? 'bg-slate-700 cursor-wait' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                {isExporting ? 'Generating Report...' : 'Export'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>

      <AutomationConsole isLive={isLive} productCount={rawItems.length} />
    </div>
  );
}
