/**
 * Performance optimization utilities
 */

/**
 * Debounce function calls
 * Delays execution until after wait milliseconds have elapsed since last call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy load images
 */
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for browsers without requestIdleCallback
  return setTimeout(callback, 1) as any;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(id: number) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }

  clearTimeout(id);
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
  }

  return result;
}

/**
 * Batch updates to reduce renders
 */
export function batchUpdates<T>(
  updates: T[],
  processor: (batch: T[]) => void,
  batchSize = 10,
  delay = 16
) {
  let currentBatch: T[] = [];
  let timeoutId: NodeJS.Timeout;

  const processBatch = () => {
    if (currentBatch.length > 0) {
      processor(currentBatch);
      currentBatch = [];
    }
  };

  return (update: T) => {
    currentBatch.push(update);

    if (currentBatch.length >= batchSize) {
      clearTimeout(timeoutId);
      processBatch();
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(processBatch, delay);
    }
  };
}
