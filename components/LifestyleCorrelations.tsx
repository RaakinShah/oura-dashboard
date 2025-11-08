'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LifestyleCorrelation } from '@/lib/ai-analyzer';

interface Props {
  correlations: LifestyleCorrelation[];
}

export default function LifestyleCorrelations({ correlations }: Props) {
  const getImpactIcon = (impact: number) => {
    if (impact > 0.3) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (impact < -0.3) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0.3) return 'text-green-600 bg-green-50';
    if (impact < -0.3) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImpactText = (impact: number) => {
    const absImpact = Math.abs(impact);
    if (absImpact > 0.7) return impact > 0 ? 'Very Positive' : 'Very Negative';
    if (absImpact > 0.3) return impact > 0 ? 'Positive' : 'Negative';
    return 'Neutral';
  };

  const getProgressWidth = (impact: number) => {
    return Math.abs(impact) * 100;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Impact Analysis</h2>

      <div className="space-y-6">
        {correlations.map((correlation, index) => (
          <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{correlation.factor}</h3>
                <p className="text-sm text-gray-600 mt-1">{correlation.description}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getImpactColor(correlation.impact)}`}>
                {getImpactIcon(correlation.impact)}
                <span className="text-sm font-semibold">{getImpactText(correlation.impact)}</span>
              </div>
            </div>

            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute h-full transition-all duration-500 ${
                  correlation.impact > 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'
                } rounded-full`}
                style={{ width: `${getProgressWidth(correlation.impact)}%` }}
              ></div>
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-300"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
