import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface TimelineItem {
  id: string;
  timestamp: string | Date;
  title: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  orientation?: 'vertical' | 'horizontal';
  showConnector?: boolean;
  className?: string;
}

export function Timeline({
  items,
  variant = 'default',
  orientation = 'vertical',
  showConnector = true,
  className = '',
}: TimelineProps) {
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  };

  const containerClass = orientation === 'vertical' ? 'space-y-6' : 'flex gap-6 overflow-x-auto pb-4';

  return (
    <div className={`${containerClass} ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className={`relative ${orientation === 'vertical' ? '' : 'flex-shrink-0'}`}
          initial={{ opacity: 0, x: orientation === 'vertical' ? -20 : 0, y: orientation === 'horizontal' ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {showConnector && index < items.length - 1 && (
            <div
              className={`absolute ${
                orientation === 'vertical'
                  ? 'left-6 top-12 h-full w-0.5'
                  : 'top-6 left-12 w-full h-0.5'
              } ${item.color ? `bg-${item.color}-200` : 'bg-stone-200'}`}
            />
          )}

          <div className={`flex ${orientation === 'vertical' ? 'gap-4' : 'flex-col gap-2 items-center min-w-[200px]'}`}>
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full ${
                item.color ? `bg-${item.color}-100 text-${item.color}-600` : 'bg-stone-100 text-stone-600'
              } flex items-center justify-center relative z-10`}
            >
              {item.icon || (
                <div className="w-3 h-3 rounded-full bg-current" />
              )}
            </div>

            <div className={`flex-1 ${orientation === 'horizontal' ? 'text-center' : ''}`}>
              <div className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500 mb-1">
                  {formatTimestamp(item.timestamp)}
                </p>
                <h4 className="font-semibold text-stone-900">{item.title}</h4>
                {(variant === 'default' || variant === 'detailed') && item.description && (
                  <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                )}
                {variant === 'detailed' && item.metadata && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs mt-1">
                        <span className="text-stone-500">{key}:</span>
                        <span className="text-stone-700 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
