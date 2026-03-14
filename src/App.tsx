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
import { 
  DollarSign, 
  MessageCircle, 
  Activity, 
  Target,
  Download,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildDashboardData, fetchSubCategories } from './lib/flipkartData';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [rawItems, setRawItems] = useState<Record<string, unknown>[]>([]);

  const categoryId = (import.meta.env.VITE_FLIPKART_CATEGORY_ID as string | undefined) || 'clo';

  useEffect(() => {
    let mounted = true;

    const loadMarketData = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const items = await fetchSubCategories(categoryId);
        if (mounted) {
          setRawItems(items);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to fetch market data.');
          setRawItems([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarketData();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  const dashboardData = useMemo(() => buildDashboardData(rawItems, categoryId), [rawItems, categoryId]);

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
                  {loadError} Ensure RAPIDAPI_KEY is set in .env.local and restart npm run dev.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
