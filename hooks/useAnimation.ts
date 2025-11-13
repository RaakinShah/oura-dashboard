import { useState, useEffect, useRef } from 'react';

export interface UseAnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
  autoStart?: boolean;
}

export function useAnimation(
  from: number,
  to: number,
  options: UseAnimationOptions = {}
) {
  const { duration = 1000, easing = (t) => t, autoStart = false } = options;
  const [value, setValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const currentValue = from + (to - from) * easedProgress;

    setValue(currentValue);

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = null;
    }
  };

  const start = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      startTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const stop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      setIsAnimating(false);
      startTimeRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setValue(from);
  };

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => stop();
  }, [from, to, duration, autoStart]);

  return { value, isAnimating, start, stop, reset };
}
