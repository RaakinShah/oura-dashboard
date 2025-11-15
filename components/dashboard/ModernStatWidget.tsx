'use client';

import { memo } from 'react';
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

export const ModernStatWidget = memo(function ModernStatWidget({
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
        relative bg-white rounded-3xl p-8 border-2 ${colors.border}
        shadow-xl shadow-${color}-500/10 transition-all duration-300
        group-hover:shadow-2xl group-hover:shadow-${color}-500/25 group-hover:border-${color}-300
      `}>
        {/* Background Gradient */}
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full blur-3xl group-hover:opacity-15 transition-opacity duration-500`} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-500 mb-2 uppercase tracking-wider">{title}</p>
            <h3 className="text-4xl font-black text-stone-900 tracking-tight">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-stone-600 mt-2 font-medium">{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <div className={`
            p-4 rounded-2xl bg-gradient-to-br ${colors.bg}
            shadow-xl shadow-${color}-500/60 ring-2 ring-${color}-400/20
            group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
          `}>
            <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t-2 border-stone-100">
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
              ${trend.positive
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-2 ring-green-200'
                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 ring-2 ring-red-200'
              }
            `}>
              <span className="text-base">{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-stone-600 font-semibold">{trend.label}</span>
          </div>
        )}

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
    </motion.div>
  );
});
