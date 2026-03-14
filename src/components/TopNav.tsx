import React from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

export const TopNav = () => {
  return (
    <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/10 backdrop-blur-md sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search competitors, products, or market signals..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-dark" />
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2" />

        <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 p-0.5">
            <div className="w-full h-full rounded-full bg-bg-dark flex items-center justify-center overflow-hidden">
              <img 
                src="https://picsum.photos/seed/analyst/100/100" 
                alt="User" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-white leading-none">Alex Rivera</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Senior Analyst</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
