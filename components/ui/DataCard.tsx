import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: ReactNode;
  chart?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DataCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  chart,
  footer,
  variant = 'default',
  size = 'md',
  className = '',
}: DataCardProps) {
  const variants = {
    default: 'border-stone-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
    ? TrendingDown
    : Minus;

  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-stone-600 bg-stone-100',
  };

  return (
    <motion.div
      className={`rounded-xl border ${variants[variant]} ${sizes[size]} ${className} transition-shadow hover:shadow-lg`}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <div className="text-stone-600">{icon}</div>}
            <h3 className="text-sm font-medium text-stone-600">{title}</h3>
          </div>
          <p className={`mt-2 font-bold text-stone-900 ${valueSizes[size]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${trendColors[trend.direction]}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">{trend.value}%</span>
          </div>
        )}
      </div>

      {chart && (
        <div className="mt-4">
          {chart}
        </div>
      )}

      {footer && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
