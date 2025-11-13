import { ReactNode } from 'react';
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

export function InsightCard({
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
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} mt-0.5`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className={`font-semibold ${config.textColor}`}>{title}</h4>
              {type !== 'info' && (
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${severityBadge[severity].bg} ${severityBadge[severity].text}`}>
                  {severityBadge[severity].label} Priority
                </span>
              )}
            </div>
            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className={`${config.iconColor} hover:opacity-70 transition-opacity`}
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>

          <p className={`mt-2 text-sm ${config.textColor} opacity-90`}>
            {description}
          </p>

          {confidence !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={config.textColor}>Confidence</span>
                <span className={`font-semibold ${config.textColor}`}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${config.color}-400 to-${config.color}-600`}
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
              className={`mt-3 px-4 py-2 rounded-lg bg-${config.color}-600 text-white text-sm font-medium hover:bg-${config.color}-700 transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
