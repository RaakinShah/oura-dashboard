import { useState, useEffect } from 'react';
import { throttle } from '@/lib/utils/performance';

interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Hook for tracking scroll position
 */
export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = throttle(() => {
      setPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

/**
 * Hook for detecting scroll direction
 */
export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentY = window.pageYOffset;

      if (currentY > lastY) {
        setDirection('down');
      } else if (currentY < lastY) {
        setDirection('up');
      }

      setLastY(currentY);
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  return direction;
}

/**
 * Hook to detect if scrolled past a threshold
 */
export function useScrollThreshold(threshold = 100): boolean {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsPastThreshold(window.pageYOffset > threshold);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isPastThreshold;
}
