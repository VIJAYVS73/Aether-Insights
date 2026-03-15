import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  Bell, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Zap, label: 'Competitor Intel', active: false },
  { icon: TrendingUp, label: 'Price Monitoring', active: false },
  { icon: MessageSquare, label: 'Review Insights', active: false },
  { icon: Target, label: 'Market Ops', active: false },
  { icon: Bell, label: 'Alerts', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-white/10 flex flex-col h-screen sticky top-0 bg-black/20 backdrop-blur-md">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">AETHER <span className="text-blue-500">INSIGHTS</span></span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.label;
          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Pro Plan</p>
          <p className="text-sm text-slate-300 mb-3">Unlock deep market analysis with AI Thinking Mode.</p>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};
