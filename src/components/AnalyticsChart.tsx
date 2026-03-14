import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import type { ChartPoint } from '../lib/flipkartData';

const defaultData: ChartPoint[] = [
  { name: 'Mon', you: 4000, compA: 2400, compB: 2400 },
  { name: 'Tue', you: 3000, compA: 1398, compB: 2210 },
  { name: 'Wed', you: 2000, compA: 9800, compB: 2290 },
  { name: 'Thu', you: 2780, compA: 3908, compB: 2000 },
  { name: 'Fri', you: 1890, compA: 4800, compB: 2181 },
  { name: 'Sat', you: 2390, compA: 3800, compB: 2500 },
  { name: 'Sun', you: 3490, compA: 4300, compB: 2100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl backdrop-blur-md shadow-2xl">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
<<<<<<< HEAD
            <span className="text-white font-mono">₹{entry.value}</span>
=======
            <span className="text-white font-mono">${entry.value}</span>
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface AnalyticsChartProps {
  series?: ChartPoint[];
  isLoading?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ series, isLoading = false }) => {
  const chartData = series && series.length ? series : defaultData;

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCompA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
<<<<<<< HEAD
            tickFormatter={(value) => `₹${value}`}
=======
            tickFormatter={(value) => `$${value}`}
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="you" 
            name="Your Brand"
            stroke="#3B82F6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorYou)" 
          />
          <Area 
            type="monotone" 
            dataKey="compA" 
            name="Competitor A"
            stroke="#8B5CF6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorCompA)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      {isLoading && (
        <p className="text-xs text-slate-400 mt-3">Refreshing trend lines from live category response...</p>
      )}
    </div>
  );
};
