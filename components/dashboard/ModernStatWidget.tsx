'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ModernStatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'cyan' | 'pink';
  delay?: number;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-cyan-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    bg: 'from-purple-500 to-pink-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  green: {
    bg: 'from-green-500 to-emerald-500',
    light: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  orange: {
    bg: 'from-orange-500 to-amber-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  red: {
    bg: 'from-red-500 to-rose-500',
    light: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  cyan: {
    bg: 'from-cyan-500 to-blue-500',
    light: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  pink: {
    bg: 'from-pink-500 to-rose-500',
    light: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
  },
};

export function ModernStatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: ModernStatWidgetProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden"
    >
      {/* Main Card */}
      <div className={`
        relative bg-white rounded-2xl p-6 border-2 ${colors.border}
        shadow-lg shadow-${color}-500/10 transition-all duration-300
        group-hover:shadow-2xl group-hover:shadow-${color}-500/20
      `}>
        {/* Background Gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-300`} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-stone-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-stone-900">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <div className={`
            p-3 rounded-xl bg-gradient-to-br ${colors.bg}
            shadow-lg shadow-${color}-500/50
            group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
              ${trend.positive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }
            `}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-xs text-stone-500">{trend.label}</span>
          </div>
        )}

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
}
