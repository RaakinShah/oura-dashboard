import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  ratio?: number;
  gap?: number;
  orientation?: 'horizontal' | 'vertical';
  resizable?: boolean;
  className?: string;
}

export function SplitLayout({
  left,
  right,
  ratio = 50,
  gap = 16,
  orientation = 'horizontal',
  resizable = false,
  className = '',
}: SplitLayoutProps) {
  const leftSize = `${ratio}%`;
  const rightSize = `${100 - ratio}%`;

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col h-full ${className}`} style={{ gap: `${gap}px` }}>
        <motion.div
          className="overflow-auto"
          style={{ height: leftSize }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {left}
        </motion.div>
        <motion.div
          className="overflow-auto"
          style={{ height: rightSize }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {right}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${className}`} style={{ gap: `${gap}px` }}>
      <motion.div
        className="overflow-auto"
        style={{ width: leftSize }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {left}
      </motion.div>
      {resizable && (
        <div className="w-1 bg-stone-200 hover:bg-indigo-500 cursor-col-resize transition-colors" />
      )}
      <motion.div
        className="overflow-auto"
        style={{ width: rightSize }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {right}
      </motion.div>
    </div>
  );
}
