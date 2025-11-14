import { useState, useEffect } from 'react';

export interface UseFadeInOptions {
  duration?: number;
  delay?: number;
  threshold?: number;
}

export function useFadeIn(options: UseFadeInOptions = {}) {
  const { duration = 500, delay = 0, threshold = 0 } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-in-out`,
  };

  return { isVisible, style };
}
