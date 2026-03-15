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
import { DateRangeSelector } from './components/DateRangeSelector';
import { HighDemandProducts } from './components/HighDemandProducts';
import { GeoDemandAlerts } from './components/GeoDemandAlerts';
import {
  DollarSign,
  MessageCircle,
  Activity,
  Target,
  Download,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildDashboardData, fetchRealTimeProducts, getProductsByPeriod } from './lib/flipkartData';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState('Live');
  const [showDateRangeSelector, setShowDateRangeSelector] = useState(false);
  const [priceMonitoringLive, setPriceMonitoringLive] = useState(true);
  const [realtimePrices, setRealtimePrices] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadMarketData = async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      setLoadError('');

      try {
        const items = await fetchRealTimeProducts();

        if (mounted && dateRangeLabel === 'Live') {
          setRawItems(items);
          if (!isBackground) setHasInitialLoaded(true);
        }
      } catch (error) {
        if (mounted && dateRangeLabel === 'Live') {
          setLoadError(error instanceof Error ? error.message : 'Failed to fetch market data.');
          if (!isBackground) setRawItems([]);
        }
      } finally {
        if (mounted && !isBackground) {
          setIsLoading(false);
        }
      }
    };

    if (!hasInitialLoaded && dateRangeLabel === 'Live') {
      loadMarketData();
    }

    let interval: NodeJS.Timeout | null = null;
    if (isLive && dateRangeLabel === 'Live') {
      interval = setInterval(() => {
        loadMarketData(true);
      }, 5000);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isLive, hasInitialLoaded, dateRangeLabel]);

  // Load CSV data when date range changes
  useEffect(() => {
    let mounted = true;

    if (dateRangeLabel === 'Live') {
      // When Live is selected, enable live mode
      console.log('Switching to Live mode');
      setIsLive(true);
    } else {
      // When historical range is selected, disable live mode and load CSV data
      console.log(`Loading data for date range: ${dateRangeLabel}`);
      setIsLive(false);
      setIsLoading(true);
      
      const loadFilteredData = async () => {
        try {
          const filteredProducts = await getProductsByPeriod(dateRangeLabel);
          if (mounted) {
            console.log(`Loaded ${filteredProducts.length} products for ${dateRangeLabel}`);
            setRawItems(filteredProducts);
            setLoadError('');
          }
        } catch (error) {
          if (mounted) {
            console.error('Failed to load filtered products:', error);
            setLoadError('Failed to load historical data');
            setRawItems([]);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      loadFilteredData();
    }

    return () => {
      mounted = false;
    };
  }, [dateRangeLabel]);

  // Real-time price monitoring
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout | null = null;

    if (activeTab === 'Price Monitoring' && priceMonitoringLive) {
      const updateRealtimePrices = async () => {
        try {
          const items = await fetchRealTimeProducts();
          if (mounted) {
            // Generate realistic time-series data with price fluctuations
            const priceUpdates = items.slice(0, 4).map(item => ({
              name: item.title?.substring(0, 15) || 'Product',
              current: item.price,
              previous: item.price * (0.95 + Math.random() * 0.1),
              change: ((item.price - (item.price * (0.95 + Math.random() * 0.1))) / (item.price * (0.95 + Math.random() * 0.1)) * 100).toFixed(2),
              status: Math.random() > 0.5 ? 'up' : 'down'
            }));
            setRealtimePrices(priceUpdates);
          }
        } catch (error) {
          console.error('Failed to update real-time prices:', error);
        }
      };

      updateRealtimePrices();
      interval = setInterval(updateRealtimePrices, 3000);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [activeTab, priceMonitoringLive]);

  const dashboardData = useMemo(() => buildDashboardData(rawItems, dateRangeLabel), [rawItems, dateRangeLabel]);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Prepare products data
      const productsData = rawItems.slice(0, 100).map(item => ({
        'Product Name': item.title || 'N/A',
        'Category': item.category || 'N/A',
        'Price': item.price || 'N/A',
        'Rating': item.rating || 'N/A',
        'Reviews': item.reviews || '0',
        'Stock': item.stock || 'N/A',
        'Discount': item.discountPercentage || '0',
      }));

      // Create CSV content
      const headers = Object.keys(productsData[0] || {});
      const csvContent = [
        headers.join(','),
        ...productsData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escapedValue = String(value).replace(/"/g, '""');
            return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `aether-insights-${dateRangeLabel}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      setTimeout(() => setIsExporting(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

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

            {/* High Demand Products Map */}
            <section className="glass-card p-6">
              <HighDemandProducts products={dashboardData.products} />
            </section>

            {/* Geolocation-Based Demand Surge Alerts */}
            <section className="glass-card p-6">
              <GeoDemandAlerts products={dashboardData.products} isLoading={isLoading} />
            </section>

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
            {/* Real-time Toggle */}
            <section className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Price Monitoring</h3>
                  <p className="text-xs text-slate-500">Track product prices in real-time</p>
                </div>
                <button
                  onClick={() => setPriceMonitoringLive(!priceMonitoringLive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    priceMonitoringLive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${priceMonitoringLive ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'}`} />
                  {priceMonitoringLive ? 'Live' : 'Historical'}
                </button>
              </div>

              {priceMonitoringLive && realtimePrices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {realtimePrices.map((price, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-white/10"
                    >
                      <p className="text-sm text-slate-400 mb-2 truncate">{price.name}</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-lg font-bold text-white">₹{price.current}</p>
                        <span className={`text-xs font-bold ${price.status === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {price.status === 'up' ? '↑' : '↓'} {Math.abs(price.change)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Previous: ₹{price.previous.toFixed(0)}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Chart Section */}
            <section className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                {priceMonitoringLive ? 'Real-time Price Trends' : 'Historical Price Trends'}
              </h3>
              <AnalyticsChart series={dashboardData.chart} isLoading={isLoading} />
            </section>

            {/* Data Table */}
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
            <MarketOps data={dashboardData.marketOps} isLoading={isLoading} products={rawItems} />
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
              <button 
                onClick={() => setShowDateRangeSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all">
                <Calendar className="w-4 h-4" />
                {dateRangeLabel}
              </button>
              <button
                onClick={exportToCSV}
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

      <DateRangeSelector
        isOpen={showDateRangeSelector}
        onClose={() => setShowDateRangeSelector(false)}
        onSelect={(startDate, endDate, label) => {
          setDateRangeLabel(label);
          setShowDateRangeSelector(false);
        }}
        currentLabel={dateRangeLabel}
      />
    </div>
  );
}
