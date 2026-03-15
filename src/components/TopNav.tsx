import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, Brain } from 'lucide-react';

type AIProvider = 'ollama' | 'gemini' | 'mock' | null;

export const TopNav = () => {
  const [aiProvider, setAiProvider] = useState<AIProvider>(null);
  const [ollamaModel, setOllamaModel] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      fetch('/api/ai/status')
        .then((r) => r.json())
        .then((d) => {
          setAiProvider(d.provider ?? 'mock');
          setOllamaModel(d.active_model ?? null);
        })
        .catch(() => setAiProvider('mock'));
    };
    check();
    // Re-check every 30 s so the pill updates if Ollama starts/stops
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

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

      <div className="flex items-center gap-4">
        {/* AI provider indicator */}
        {aiProvider !== null && (
          <div
            title={
              aiProvider === 'ollama' ? `Ollama running — model: ${ollamaModel ?? 'unknown'}` :
              aiProvider === 'gemini' ? `Gemini AI — cloud mode` :
              'No AI provider — using mock data'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none cursor-default transition-all ${
              aiProvider === 'ollama' ? 'bg-emerald-500/15 text-emerald-400' :
              aiProvider === 'gemini' ? 'bg-blue-500/15 text-blue-400' :
              'bg-amber-500/15 text-amber-400'
            }`}
          >
            <Brain className="w-3 h-3" />
            <span className={`w-1.5 h-1.5 rounded-full ${
              aiProvider === 'ollama' ? 'bg-emerald-400 animate-pulse' :
              aiProvider === 'gemini' ? 'bg-blue-400 animate-pulse' :
              'bg-amber-400'
            }`} />
            {aiProvider === 'ollama' ? `Ollama · ${ollamaModel ?? ''}` :
             aiProvider === 'gemini' ? 'Gemini' :
             'AI Offline'}
          </div>
        )}

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-dark" />
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2" />

        <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-all">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-500 to-emerald-500 p-0.5">
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
