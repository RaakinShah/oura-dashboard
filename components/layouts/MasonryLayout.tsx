import { ReactNode, useEffect, useRef, useState } from 'react';

export interface MasonryLayoutProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export function MasonryLayout({
  children,
  columns = 3,
  gap = 16,
  responsive,
  className = '',
}: MasonryLayoutProps) {
  const [columnCount, setColumnCount] = useState(columns);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!responsive) return;

    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280 && responsive.xl) {
        setColumnCount(responsive.xl);
      } else if (width >= 1024 && responsive.lg) {
        setColumnCount(responsive.lg);
      } else if (width >= 768 && responsive.md) {
        setColumnCount(responsive.md);
      } else if (width >= 640 && responsive.sm) {
        setColumnCount(responsive.sm);
      } else {
        setColumnCount(columns);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [responsive, columns]);

  const childrenArray = Array.isArray(children) ? children : [children];
  const columnWrappers: ReactNode[][] = Array.from({ length: columnCount }, () => []);

  childrenArray.forEach((child, index) => {
    const columnIndex = index % columnCount;
    columnWrappers[columnIndex].push(child);
  });

  return (
    <div
      ref={containerRef}
      className={`flex ${className}`}
      style={{ gap: `${gap}px`, marginLeft: `-${gap / 2}px`, marginRight: `-${gap / 2}px` }}
    >
      {columnWrappers.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`,
            paddingLeft: `${gap / 2}px`,
            paddingRight: `${gap / 2}px`,
          }}
        >
          {column}
        </div>
      ))}
    </div>
  );
}
