import React, { useState } from 'react';
import { AlertCircle, Zap, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AlertItem } from '../lib/flipkartData';

const defaultAlerts: AlertItem[] = [
  {
    type: 'critical',
    title: 'Price War Detected',
    desc: '3 competitors dropped prices on "Wireless Headphones X" by >15% in the last 4 hours.',
    time: '12m ago',
  },
  {
    type: 'opportunity',
    title: 'Stock Outage Opportunity',
    desc: 'Competitor B is out of stock on high-demand "Gaming Mouse Z". Increase ad spend.',
    time: '45m ago',
  },
  {
    type: 'trend',
    title: 'New Market Trend',
    desc: 'Rising interest in "Eco-friendly packaging" mentioned in 24% of new reviews.',
    time: '2h ago',
  },
  {
    type: 'info',
    title: 'Competitor Update',
    desc: 'Competitor A updated their product descriptions for the Summer Collection.',
    time: '5h ago',
  }
];

interface AlertsPanelProps {
  alerts?: AlertItem[];
  isLoading?: boolean;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, isLoading = false }) => {
  const [showAll, setShowAll] = useState(false);
  const panelAlerts = alerts && alerts.length ? alerts : defaultAlerts;
  const displayedAlerts = showAll ? panelAlerts : panelAlerts.slice(0, 3);

  const iconMap = {
    critical: AlertCircle,
    opportunity: Zap,
    trend: TrendingUp,
    info: Info,
  };

  const colorMap = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    opportunity: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    trend: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    info: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {displayedAlerts.map((alert, idx) => {
          const Icon = iconMap[alert.type];
          const color = colorMap[alert.type];

          return (
            <motion.div 
              key={alert.title + idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border flex gap-4 items-start ${color}`}
            >
              <div className="p-2 rounded-lg bg-white/5">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm text-white">{alert.title}</h5>
                  <span className="text-[10px] font-medium opacity-60">{alert.time}</span>
                </div>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">{alert.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isLoading && (
        <p className="text-xs text-slate-400">Updating alerts from latest market payload...</p>
      )}
      
      {panelAlerts.length > 3 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-slate-400 hover:text-white text-xs font-bold border border-white/5 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less ({panelAlerts.length - 3} hidden)
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View All Alerts ({panelAlerts.length} total)
            </>
          )}
        </button>
      )}
    </div>
  );
};
