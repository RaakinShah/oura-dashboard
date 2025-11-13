import { useState, useEffect } from 'react';
import { throttle } from '@/lib/utils/performance';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook for tracking window dimensions
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for tracking viewport height (useful for mobile)
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeight = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}
