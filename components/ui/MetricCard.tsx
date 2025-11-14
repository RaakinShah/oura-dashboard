import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  color?: string;
}

export interface MetricCardProps {
  title: string;
  metrics: MetricData[];
  icon?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  showDividers?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  metrics,
  icon,
  orientation = 'vertical',
  showDividers = true,
  className = '',
}: MetricCardProps) {
  return (
    <motion.div
      className={`rounded-xl border border-stone-200 bg-white p-6 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-stone-700">{icon}</div>}
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      </div>

      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center justify-between'} gap-4`}>
        {metrics.map((metric, index) => (
          <div key={index} className="flex-1">
            {index > 0 && showDividers && orientation === 'vertical' && (
              <div className="border-t border-stone-200 mb-4" />
            )}
            {index > 0 && showDividers && orientation === 'horizontal' && (
              <div className="border-l border-stone-200 h-12 mx-4" />
            )}
            <div className={orientation === 'horizontal' ? 'text-center' : ''}>
              <p className="text-sm text-stone-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metric.color || 'text-stone-900'}`}>
                {metric.value}
              </p>
              {metric.change !== undefined && (
                <p className={`text-xs mt-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}% from last period
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
