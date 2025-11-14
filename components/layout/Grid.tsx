import { ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: number;
  className?: string;
}

export function Grid({ children, cols = 1, gap = 4, className = '' }: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  };

  return (
    <div className={`grid ${colsClasses[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

export interface GridItemProps {
  children: ReactNode;
  span?: number;
  className?: string;
}

export function GridItem({ children, span = 1, className = '' }: GridItemProps) {
  return (
    <div className={`col-span-${span} ${className}`}>
      {children}
    </div>
  );
}
