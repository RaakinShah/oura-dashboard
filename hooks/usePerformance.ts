import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Custom hook for detecting if an element is in viewport
 */
export function useInViewport(ref: React.RefObject<HTMLElement>): boolean {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref]);

  return isInViewport;
}

/**
 * Custom hook for lazy loading data
 */
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await loadFn();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

/**
 * Custom hook for memoizing expensive computations
 */
export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const ref = useRef<T | undefined>(undefined);

  if (!ref.current || !compare(ref.current, value)) {
    ref.current = value;
  }

  return ref.current as T;
}

/**
 * Custom hook for async state management
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true
): {
  execute: () => Promise<void>;
  data: T | null;
  loading: boolean;
  error: E | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as E);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, data, loading, error };
}

/**
 * Custom hook for measuring component performance
 */
export function usePerformance(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renders: renderCount.current,
        lastRenderTime: `${renderTime}ms`,
      });
    }

    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Custom hook for batching state updates
 */
export function useBatchedState<T>(
  initialState: T,
  batchDelay: number = 100
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Array<T | ((prev: T) => T)>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const batchedSetState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      pendingUpdates.current.push(updater);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setState(prevState => {
          let newState = prevState;
          pendingUpdates.current.forEach(update => {
            newState = typeof update === 'function'
              ? (update as (prev: T) => T)(newState)
              : update;
          });
          pendingUpdates.current = [];
          return newState;
        });
      }, batchDelay);
    },
    [batchDelay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState];
}

import { useState } from 'react';
