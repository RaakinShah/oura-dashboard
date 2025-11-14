import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GridItem {
  id: string;
  content: ReactNode;
  span?: {
    cols?: number;
    rows?: number;
  };
  minWidth?: number;
  priority?: number;
}

export interface ResponsiveGridProps {
  items: GridItem[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  autoFlow?: 'row' | 'column' | 'dense';
  animate?: boolean;
  className?: string;
}

export function ResponsiveGrid({
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 16,
  autoFlow = 'row',
  animate = true,
  className = '',
}: ResponsiveGridProps) {
  const [cols, setCols] = useState(columns.lg || 4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCols(columns.xs || 1);
      } else if (width < 768) {
        setCols(columns.sm || 2);
      } else if (width < 1024) {
        setCols(columns.md || 3);
      } else if (width < 1280) {
        setCols(columns.lg || 4);
      } else {
        setCols(columns.xl || 6);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  // Sort items by priority
  const sortedItems = [...items].sort((a, b) =>
    (b.priority || 0) - (a.priority || 0)
  );

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap}px`,
    gridAutoFlow: autoFlow,
  };

  return (
    <div className={className} style={gridStyle}>
      <AnimatePresence mode="popLayout">
        {sortedItems.map((item, index) => {
          const colSpan = Math.min(item.span?.cols || 1, cols);
          const rowSpan = item.span?.rows || 1;

          return (
            <motion.div
              key={item.id}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                minWidth: item.minWidth,
              }}
              initial={animate ? { opacity: 0, scale: 0.9 } : undefined}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              exit={animate ? { opacity: 0, scale: 0.9 } : undefined}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              layout={animate}
            >
              {item.content}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
