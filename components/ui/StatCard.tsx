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
    sm: { container: 'p-5', value: 'text-2xl', label: 'text-xs' },
    md: { container: 'p-8', value: 'text-4xl', label: 'text-sm' },
    lg: { container: 'p-10', value: 'text-5xl', label: 'text-base' },
  };

  const baseClass = gradient
    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white'
    : 'bg-white border-2 border-stone-200 text-stone-900';

  const trendEmoji = {
    increasing: '📈',
    decreasing: '📉',
    stable: '➡️',
  };

  return (
    <motion.div
      className={`rounded-3xl ${baseClass} ${sizes[size].container} ${className} shadow-xl hover:shadow-2xl transition-all duration-300`}
      whileHover={{ scale: 1.05, rotate: gradient ? 1 : 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={`${sizes[size].label} font-semibold ${gradient ? 'text-white/90' : 'text-stone-600'} uppercase tracking-wider`}>
          {label}
        </p>
        {icon && <div className={gradient ? 'text-white/80' : 'text-stone-500'}>{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`${sizes[size].value} font-black tracking-tight`}>
          {value}
        </p>
        {unit && (
          <span className={`text-lg font-medium ${gradient ? 'text-white/70' : 'text-stone-500'}`}>
            {unit}
          </span>
        )}
      </div>

      {prediction && (
        <motion.div
          className={`mt-6 pt-6 border-t-2 ${gradient ? 'border-white/20' : 'border-stone-200'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Sparkles className={`h-5 w-5 ${gradient ? 'text-yellow-300' : 'text-indigo-500'}`} strokeWidth={2.5} />
            <span className={`text-xs font-bold ${gradient ? 'text-white/90' : 'text-stone-700'} uppercase tracking-wider`}>
              AI Prediction
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">{prediction.value}</span>
            {unit && <span className={`text-sm font-medium ${gradient ? 'text-white/70' : 'text-stone-500'}`}>{unit}</span>}
            <span className="ml-2 text-lg">{trendEmoji[prediction.trend]}</span>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-semibold ${gradient ? 'text-white/80' : 'text-stone-600'}`}>
              Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </div>
            <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={gradient ? 'h-full bg-white shadow-lg' : 'h-full bg-indigo-500 shadow-lg'}
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
