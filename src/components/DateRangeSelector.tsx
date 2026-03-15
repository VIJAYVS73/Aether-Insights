import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface DateRangeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (startDate: Date, endDate: Date, label: string) => void;
  currentLabel?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentLabel = 'Last 30 Days',
}) => {
  const today = new Date();

  const presets = [
    {
      label: 'Live',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        return { start, end };
      },
    },
    {
      label: 'Last 7 Days',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 7);
        return { start, end };
      },
    },
    {
      label: 'Last 30 Days',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 30);
        return { start, end };
      },
    },
    {
      label: 'Last 90 Days',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 90);
        return { start, end };
      },
    },
    {
      label: 'Last 6 Months',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        start.setMonth(start.getMonth() - 6);
        return { start, end };
      },
    },
    {
      label: 'Last Year',
      getDates: () => {
        const end = new Date(today);
        const start = new Date(today);
        start.setFullYear(start.getFullYear() - 1);
        return { start, end };
      },
    },
  ];

  const handlePresetSelect = (label: string) => {
    const preset = presets.find((p) => p.label === label);
    if (preset) {
      const { start, end } = preset.getDates();
      onSelect(start, end, label);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Select Date Range</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset.label)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentLabel === preset.label
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
};
