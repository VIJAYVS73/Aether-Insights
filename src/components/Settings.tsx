import React from 'react';
import { User, Bell, Shield, Database, Globe } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <User className="w-6 h-6 text-blue-400" />
          Profile Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input type="text" defaultValue="Alex Rivera" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input type="email" defaultValue="alex.rivera@aetherinsights.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <Bell className="w-6 h-6 text-purple-400" />
          Notification Preferences
        </h3>
        <div className="space-y-6">
          {[
            { label: 'Price War Alerts', desc: 'Notify when 3+ competitors drop prices simultaneously.' },
            { label: 'Market Opportunity Signals', desc: 'AI-driven alerts for stock outages and trend shifts.' },
            { label: 'Weekly Performance Digest', desc: 'A summary of your market share and sentiment trends.' }
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};
