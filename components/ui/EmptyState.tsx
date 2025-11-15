import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, AlertCircle, Settings, TrendingUp } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'database' | 'refresh' | 'alert' | 'settings' | 'trending';
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'error' | 'warning';
  className?: string;
}

const iconComponents = {
  database: Database,
  refresh: RefreshCw,
  alert: AlertCircle,
  settings: Settings,
  trending: TrendingUp,
};

const variantStyles = {
  default: {
    bg: 'from-stone-50 to-stone-100',
    border: 'border-stone-200',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    textColor: 'text-stone-900',
    descColor: 'text-stone-600',
  },
  error: {
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
    descColor: 'text-red-700',
  },
  warning: {
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    descColor: 'text-amber-700',
  },
};

export function EmptyState({
  title,
  description,
  icon = 'database',
  action,
  secondaryAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const Icon = iconComponents[icon];
  const styles = variantStyles[variant];

  return (
    <motion.div
      className={`bg-gradient-to-br ${styles.bg} border-2 ${styles.border} rounded-3xl p-12 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      <motion.div
        className={`inline-flex items-center justify-center w-20 h-20 ${styles.iconBg} rounded-2xl mb-6`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Icon className={`w-10 h-10 ${styles.iconColor}`} strokeWidth={2} />
      </motion.div>

      {/* Title */}
      <motion.h3
        className={`text-2xl font-bold ${styles.textColor} mb-3`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className={`text-base ${styles.descColor} max-w-md mx-auto leading-relaxed mb-8`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 border-2 border-stone-300 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 hover:border-stone-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {secondaryAction.label}
            </button>
          )}
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <motion.div
          className={`absolute -top-10 -right-10 w-40 h-40 ${styles.iconBg} rounded-full blur-3xl opacity-30`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={`absolute -bottom-10 -left-10 w-40 h-40 ${styles.iconBg} rounded-full blur-3xl opacity-30`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>
    </motion.div>
  );
}
