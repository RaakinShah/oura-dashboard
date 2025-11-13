import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export interface ComparisonItem {
  label: string;
  current: number;
  previous: number;
  unit?: string;
  format?: (value: number) => string;
}

export interface ComparisonCardProps {
  title: string;
  subtitle?: string;
  items: ComparisonItem[];
  icon?: ReactNode;
  showPercentage?: boolean;
  highlightImprovement?: boolean;
  className?: string;
}

export function ComparisonCard({
  title,
  subtitle,
  items,
  icon,
  showPercentage = true,
  highlightImprovement = true,
  className = '',
}: ComparisonCardProps) {
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (item: ComparisonItem, value: number): string => {
    if (item.format) return item.format(value);
    return `${value}${item.unit || ''}`;
  };

  return (
    <motion.div
      className={`rounded-xl border border-stone-200 bg-white p-6 ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-5">
        {icon && <div className="text-stone-700">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
          {subtitle && <p className="text-sm text-stone-600">{subtitle}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const change = calculateChange(item.current, item.previous);
          const isImprovement = change > 0;
          const isNegative = change < 0;

          return (
            <motion.div
              key={index}
              className="pb-4 last:pb-0 border-b last:border-b-0 border-stone-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">{item.label}</span>
                {showPercentage && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    highlightImprovement
                      ? isImprovement
                        ? 'bg-green-100 text-green-700'
                        : isNegative
                        ? 'bg-red-100 text-red-700'
                        : 'bg-stone-100 text-stone-700'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {isImprovement ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
                    <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-stone-500 mb-1">Previous</div>
                  <div className="text-lg font-semibold text-stone-600">
                    {formatValue(item, item.previous)}
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-stone-400 flex-shrink-0" />

                <div className="flex-1">
                  <div className="text-xs text-stone-500 mb-1">Current</div>
                  <div className={`text-lg font-semibold ${
                    highlightImprovement && isImprovement
                      ? 'text-green-600'
                      : highlightImprovement && isNegative
                      ? 'text-red-600'
                      : 'text-stone-900'
                  }`}>
                    {formatValue(item, item.current)}
                  </div>
                </div>
              </div>

              <div className="mt-2 h-2 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    highlightImprovement && isImprovement
                      ? 'bg-green-500'
                      : highlightImprovement && isNegative
                      ? 'bg-red-500'
                      : 'bg-indigo-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.current / (item.previous * 2)) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
