import { ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';

export interface InsightCardProps {
  type: 'pattern' | 'anomaly' | 'recommendation' | 'prediction' | 'info';
  severity?: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  confidence?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const InsightCard = memo(function InsightCard({
  type,
  severity = 'low',
  title,
  description,
  confidence,
  action,
  data,
  dismissible = false,
  onDismiss,
  className = '',
}: InsightCardProps) {
  const typeConfig = {
    pattern: {
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
    },
    anomaly: {
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
    },
    recommendation: {
      icon: Lightbulb,
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
    },
    prediction: {
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      iconColor: 'text-purple-600',
    },
    info: {
      icon: Info,
      color: 'stone',
      bgColor: 'bg-stone-50',
      borderColor: 'border-stone-200',
      textColor: 'text-stone-900',
      iconColor: 'text-stone-600',
    },
  };

  const severityBadge = {
    low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Medium' },
    high: { bg: 'bg-red-100', text: 'text-red-800', label: 'High' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-start gap-4">
        <div className={`${config.iconColor} mt-1`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className={`text-lg font-bold ${config.textColor} tracking-tight`}>{title}</h4>
              {type !== 'info' && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-xs font-bold ${severityBadge[severity].bg} ${severityBadge[severity].text} uppercase tracking-wide shadow-sm`}>
                  {severityBadge[severity].label} Priority
                </span>
              )}
            </div>
            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className={`${config.iconColor} hover:opacity-70 transition-opacity p-2 rounded-lg hover:bg-white/50`}
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>

          <p className={`mt-3 text-sm font-medium ${config.textColor} opacity-90 leading-relaxed`}>
            {description}
          </p>

          {confidence !== undefined && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`${config.textColor} font-semibold uppercase tracking-wide`}>Confidence</span>
                <span className={`font-black ${config.textColor}`}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 bg-white/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${config.color}-400 to-${config.color}-600 shadow-lg`}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-4 px-5 py-2.5 rounded-xl bg-${config.color}-600 text-white text-sm font-bold hover:bg-${config.color}-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
