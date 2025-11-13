import { ReactNode } from 'react';

export interface GridLayoutProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  responsive?: boolean;
  className?: string;
}

export function GridLayout({
  children,
  cols = 3,
  gap = 6,
  responsive = true,
  className = '',
}: GridLayoutProps) {
  const colClasses = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${colClasses[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

export interface FlexLayoutProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  wrap?: boolean;
  className?: string;
}

export function FlexLayout({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 4,
  wrap = false,
  className = '',
}: FlexLayoutProps) {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={`flex flex-${direction} ${alignClasses[align]} ${justifyClasses[justify]} gap-${gap} ${wrap ? 'flex-wrap' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
