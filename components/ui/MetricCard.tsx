import { ReactNode, memo } from 'react';
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

export const MetricCard = memo(function MetricCard({
  title,
  metrics,
  icon,
  orientation = 'vertical',
  showDividers = true,
  className = '',
}: MetricCardProps) {
  return (
    <motion.div
      className={`rounded-3xl border-2 border-stone-200 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-4 mb-6">
        {icon && <div className="text-stone-700">{icon}</div>}
        <h3 className="text-xl font-bold text-stone-900 tracking-tight">{title}</h3>
      </div>

      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center justify-between'} gap-5`}>
        {metrics.map((metric, index) => (
          <div key={index} className="flex-1">
            {index > 0 && showDividers && orientation === 'vertical' && (
              <div className="border-t-2 border-stone-200 mb-5" />
            )}
            {index > 0 && showDividers && orientation === 'horizontal' && (
              <div className="border-l-2 border-stone-200 h-12 mx-4" />
            )}
            <div className={orientation === 'horizontal' ? 'text-center' : ''}>
              <p className="text-sm font-semibold text-stone-600 uppercase tracking-wide">{metric.label}</p>
              <p className={`text-3xl font-black mt-2 tracking-tight ${metric.color || 'text-stone-900'}`}>
                {metric.value}
              </p>
              {metric.change !== undefined && (
                <p className={`text-xs mt-2 font-bold ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change >= 0 ? '↑ +' : '↓ '}{metric.change}% from last period
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
});
