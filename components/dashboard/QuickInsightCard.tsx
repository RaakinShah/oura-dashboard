'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuickInsightCardProps {
  title: string;
  insights: string[];
  type: 'positive' | 'warning' | 'neutral';
  delay?: number;
}

const typeStyles = {
  positive: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: TrendingUp,
  },
  warning: {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: TrendingDown,
  },
  neutral: {
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: Minus,
  },
};

export function QuickInsightCard({ title, insights, type, delay = 0 }: QuickInsightCardProps) {
  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="group"
    >
      <div className={`
        relative bg-white rounded-2xl p-6 border-2 ${style.border}
        shadow-lg hover:shadow-2xl transition-all duration-300
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${style.gradient}`}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 * (index + 1), duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className={`mt-1 p-1 rounded-full bg-gradient-to-br ${style.gradient}`}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm text-stone-700 flex-1">{insight}</p>
            </motion.div>
          ))}
        </div>

        {/* Background Decoration */}
        <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br ${style.gradient} opacity-5 rounded-full blur-3xl`} />
      </div>
    </motion.div>
  );
}
