import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`glass-card glass-card-hover p-6 bg-gradient-to-br ${colorMap[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
      </div>
      
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${
            color === 'blue' ? 'bg-blue-500' : 
            color === 'purple' ? 'bg-purple-500' : 
            color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </div>
    </motion.div>
  );
};
