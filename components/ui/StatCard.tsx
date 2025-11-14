import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  prediction?: {
    value: string | number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  icon?: ReactNode;
  gradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  prediction,
  icon,
  gradient = false,
  size = 'md',
  className = '',
}: StatCardProps) {
  const sizes = {
    sm: { container: 'p-4', value: 'text-2xl', label: 'text-xs' },
    md: { container: 'p-6', value: 'text-4xl', label: 'text-sm' },
    lg: { container: 'p-8', value: 'text-5xl', label: 'text-base' },
  };

  const baseClass = gradient
    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white'
    : 'bg-white border border-stone-200 text-stone-900';

  const trendEmoji = {
    increasing: '📈',
    decreasing: '📉',
    stable: '➡️',
  };

  return (
    <motion.div
      className={`rounded-2xl ${baseClass} ${sizes[size].container} ${className} shadow-lg`}
      whileHover={{ scale: 1.05, rotate: gradient ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`${sizes[size].label} font-medium ${gradient ? 'text-white/90' : 'text-stone-600'} uppercase tracking-wide`}>
          {label}
        </p>
        {icon && <div className={gradient ? 'text-white/80' : 'text-stone-500'}>{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`${sizes[size].value} font-bold`}>
          {value}
        </p>
        {unit && (
          <span className={`text-lg ${gradient ? 'text-white/70' : 'text-stone-500'}`}>
            {unit}
          </span>
        )}
      </div>

      {prediction && (
        <motion.div
          className={`mt-4 pt-4 border-t ${gradient ? 'border-white/20' : 'border-stone-200'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`h-4 w-4 ${gradient ? 'text-yellow-300' : 'text-indigo-500'}`} />
            <span className={`text-xs font-semibold ${gradient ? 'text-white/90' : 'text-stone-700'}`}>
              AI Prediction
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{prediction.value}</span>
            {unit && <span className={`text-sm ${gradient ? 'text-white/70' : 'text-stone-500'}`}>{unit}</span>}
            <span className="ml-2">{trendEmoji[prediction.trend]}</span>
          </div>
          <div className="mt-2">
            <div className={`text-xs ${gradient ? 'text-white/80' : 'text-stone-600'}`}>
              Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </div>
            <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={gradient ? 'h-full bg-white' : 'h-full bg-indigo-500'}
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
