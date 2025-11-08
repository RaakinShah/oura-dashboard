'use client';

import { PerformanceWindow } from '@/lib/ai-analyzer';

interface Props {
  windows: PerformanceWindow[];
}

export default function PerformanceWindows({ windows }: Props) {
  const getEnergyColor = (level: 'peak' | 'good' | 'moderate' | 'low') => {
    switch (level) {
      case 'peak':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
    }
  };

  const getEnergyLabel = (level: 'peak' | 'good' | 'moderate' | 'low') => {
    switch (level) {
      case 'peak':
        return 'Peak Performance';
      case 'good':
        return 'Good Energy';
      case 'moderate':
        return 'Moderate Energy';
      case 'low':
        return 'Low Energy';
    }
  };

  const maxEnergy = Math.max(...windows.map(w => w.energy));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Energy Throughout The Day</h2>

      <div className="space-y-4">
        {windows.map((window, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 w-16">
              {window.time}
            </span>

            <div className="flex-1 relative">
              <div className="h-12 bg-gray-100 rounded-xl overflow-hidden">
                <div
                  className={`h-full ${getEnergyColor(window.level)} transition-all duration-500 rounded-xl flex items-center px-3`}
                  style={{ width: `${(window.energy / maxEnergy) * 100}%` }}
                >
                  {window.energy / maxEnergy > 0.3 && (
                    <span className="text-white text-xs font-semibold">
                      {Math.round(window.energy)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-500 w-32">
              {getEnergyLabel(window.level)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Schedule your most important tasks during peak performance windows for optimal productivity.
        </p>
      </div>
    </div>
  );
}
