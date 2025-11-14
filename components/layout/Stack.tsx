import { ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  className?: string;
}

export function Stack({
  children,
  direction = 'vertical',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
}: StackProps) {
  const directionClass = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  
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
  };

  return (
    <div
      className={`flex ${directionClass} ${alignClasses[align]} ${justifyClasses[justify]} ${
        wrap ? 'flex-wrap' : ''
      } gap-${spacing} ${className}`}
    >
      {children}
    </div>
  );
}
