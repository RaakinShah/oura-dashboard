import { useState, useEffect } from 'react';

export interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

export function useCountUp(options: UseCountUpOptions) {
  const {
    start = 0,
    end,
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
  } = options;

  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const currentCount = start + (end - start) * progress;
        setCount(currentCount);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [start, end, duration]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + (parts[1] ? `${integerPart}.${parts[1]}` : integerPart) + suffix;
  };

  return { count, formatted: formatNumber(count), isComplete };
}
