'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export interface DateRange {
  start: string;
  end: string;
  label: string;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRange[];
}

const DEFAULT_PRESETS: DateRange[] = [
  {
    label: 'Last 7 Days',
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 30 Days',
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 90 Days',
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'This Month',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last Month',
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
  },
];

export function DateRangeFilter({ value, onChange, presets = DEFAULT_PRESETS }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const handlePresetClick = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
    setCustomMode(false);
  };

  const handleCustomChange = (field: 'start' | 'end', date: string) => {
    onChange({
      ...value,
      [field]: date,
      label: 'Custom Range',
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-refined btn-secondary inline-flex"
        aria-label="Select date range"
      >
        <Calendar className="h-4 w-4" />
        <span>{value.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-stone-200 rounded-lg shadow-xl min-w-[280px] animate-scale-in">
            <div className="p-2">
              {/* Presets */}
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`
                    w-full text-left px-4 py-2.5 rounded-lg
                    text-sm font-medium
                    transition-colors
                    ${value.label === preset.label
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}

              {/* Custom Range Toggle */}
              <button
                onClick={() => setCustomMode(!customMode)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Custom Range
              </button>

              {/* Custom Range Inputs */}
              {customMode && (
                <div className="mt-2 p-4 border-t border-stone-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={value.start}
                      onChange={(e) => handleCustomChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-200/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={value.end}
                      onChange={(e) => handleCustomChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-200/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
