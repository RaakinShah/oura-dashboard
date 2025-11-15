import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChartHelpProps {
  title: string;
  description: string;
  tips?: string[];
  interpretation?: {
    label: string;
    description: string;
    color?: string;
  }[];
  controls?: {
    label: string;
    description: string;
  }[];
  className?: string;
}

export function ChartHelp({
  title,
  description,
  tips,
  interpretation,
  controls,
  className = '',
}: ChartHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all duration-200"
        aria-label="Show chart help"
      >
        <HelpCircle className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* Help Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Popover */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border-2 border-stone-200 z-50 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-indigo-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">{title}</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    aria-label="Close help"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  {description}
                </p>

                {/* Interpretation Guide */}
                {interpretation && interpretation.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">
                      How to Interpret
                    </h4>
                    <div className="space-y-2">
                      {interpretation.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {item.color && (
                            <div
                              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-stone-900">
                              {item.label}
                            </p>
                            <p className="text-xs text-stone-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Controls */}
                {controls && controls.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
                      Interactive Controls
                    </h4>
                    <div className="space-y-2">
                      {controls.map((control, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 font-mono text-xs mt-0.5">▸</span>
                          <div>
                            <span className="text-sm font-semibold text-blue-900">
                              {control.label}:
                            </span>{' '}
                            <span className="text-sm text-blue-800">
                              {control.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {tips && tips.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="text-sm font-bold text-amber-900 mb-2 uppercase tracking-wide">
                      💡 Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-sm text-amber-800 leading-relaxed flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
