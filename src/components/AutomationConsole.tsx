import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: string;
  message: string;
}

export const AutomationConsole: React.FC<{ isLive: boolean; productCount: number }> = ({ isLive, productCount }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const modules = ['BOT-01', 'ANALYZER', 'SYNC', 'SCRAPER', 'VALIDATOR'];
  const infoMessages = [
    'Scanning market categories...',
    'Performing depth check on high-volume items',
    'Syncing with local price database',
    'Validating review sentiments for batch #7',
    'Updating category distribution weights',
  ];
  const successMessages = [
    'Successfully processed 25 new events',
    'Batch sync complete. No conflicts detected',
    'Market share recalculation successful',
    'Price monitoring active for all 100 products',
  ];

  useEffect(() => {
    if (!isLive) return;

    const addLog = () => {
      const type = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'success' : 'warn') : 'info';
      const msgList = type === 'success' ? successMessages : infoMessages;
      const message = msgList[Math.floor(Math.random() * msgList.length)];
      
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: type,
        module: modules[Math.floor(Math.random() * modules.length)],
        message,
      };

      setLogs(prev => [...prev.slice(-49), newLog]);
    };

    const interval = setInterval(addLog, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`fixed bottom-0 right-8 z-50 transition-all duration-300 ${isMinimized ? 'w-64' : 'w-96 h-64'}`}>
      <div className="glass-card flex flex-col h-full overflow-hidden border-b-0 rounded-b-none border-blue-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <Terminal className={`w-4 h-4 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xs font-bold text-white tracking-widest uppercase">Live Automation Log</span>
            {isLive && <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/10 rounded-md text-slate-400 transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Console Body */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] custom-scrollbar bg-black/40"
              ref={scrollRef}
            >
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">Waiting for process start...</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-2 leading-relaxed">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    <span className={`font-bold transition-colors ${
                      log.level === 'success' ? 'text-emerald-400' : 
                      log.level === 'warn' ? 'text-amber-400' : 
                      'text-blue-400'
                    }`}>
                      [{log.module}]
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        {!isMinimized && (
          <div className="p-2 px-4 bg-white/2 border-t border-white/5 flex justify-between text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
            <span>Active Threads: {isLive ? '12' : '0'}</span>
            <span>Buffer: {logs.length}/50</span>
            <span>Monitoring: {productCount} items</span>
          </div>
        )}
      </div>
    </div>
  );
};
