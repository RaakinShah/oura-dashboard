import { useState, useEffect, useMemo, useRef } from 'react';

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Hook for virtual scrolling large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

/**
 * Hook for virtual grid scrolling
 */
export function useVirtualGrid<T>(
  items: T[],
  options: {
    itemWidth: number;
    itemHeight: number;
    containerWidth: number;
    containerHeight: number;
    gap?: number;
    overscan?: number;
  }
) {
  const { itemWidth, itemHeight, containerWidth, containerHeight, gap = 0, overscan = 1 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const columnsCount = Math.floor(containerWidth / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const rowHeight = itemHeight + gap;

  const totalHeight = rowsCount * rowHeight;
  const visibleRowsCount = Math.ceil(containerHeight / rowHeight);

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(rowsCount, startRow + visibleRowsCount + overscan * 2);

  const startIndex = startRow * columnsCount;
  const endIndex = Math.min(items.length, endRow * columnsCount);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      row: Math.floor((startIndex + index) / columnsCount),
      col: (startIndex + index) % columnsCount,
    })),
    [items, startIndex, endIndex, columnsCount]
  );

  const offsetY = startRow * rowHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    columnsCount,
    rowHeight,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}
