/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals(callback: (metric: { name: string; value: number }) => void): void {
  if (typeof window === 'undefined') return;

  // First Contentful Paint
  const fcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({ name: 'FCP', value: entry.startTime });
        fcpObserver.disconnect();
      }
    }
  });

  try {
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    // Browser doesn't support this observer
  }

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback({ name: 'LCP', value: lastEntry.startTime });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Browser doesn't support this observer
  }

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any;
      const fid = fidEntry.processingStart - fidEntry.startTime;
      callback({ name: 'FID', value: fid });
      fidObserver.disconnect();
    }
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // Browser doesn't support this observer
  }

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as any;
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value;
        callback({ name: 'CLS', value: clsValue });
      }
    }
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Browser doesn't support this observer
  }

  // Time to First Byte
  if (window.performance && window.performance.timing) {
    const ttfb = window.performance.timing.responseStart - window.performance.timing.requestStart;
    callback({ name: 'TTFB', value: ttfb });
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label && process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label && process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Create performance mark
 */
export function mark(name: string): void {
  if (window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
}

/**
 * Measure between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  if (window.performance && window.performance.measure) {
    window.performance.measure(name, startMark, endMark);
    const measures = window.performance.getEntriesByName(name, 'measure');
    if (measures.length > 0) {
      return measures[0].duration;
    }
  }
  return null;
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  limit: number;
} | null {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Detect performance issues
 */
export function detectPerformanceIssues(): {
  slowNetwork: boolean;
  lowMemory: boolean;
  highCPU: boolean;
} {
  const connection = (navigator as any).connection;
  const memory = getMemoryUsage();

  const slowNetwork = connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false;
  const lowMemory = memory ? memory.used / memory.limit > 0.9 : false;

  // CPU detection is not directly available, use frame rate as proxy
  let highCPU = false;
  const startTime = performance.now();
  requestAnimationFrame(() => {
    const frameTime = performance.now() - startTime;
    highCPU = frameTime > 16.67 * 2; // More than 2x normal frame time
  });

  return { slowNetwork, lowMemory, highCPU };
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('[Performance Metrics]');

  // Navigation Timing
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    console.log('Page Load Time:', timing.loadEventEnd - timing.navigationStart, 'ms');
    console.log('DNS Lookup:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
    console.log('TCP Connection:', timing.connectEnd - timing.connectStart, 'ms');
    console.log('TTFB:', timing.responseStart - timing.requestStart, 'ms');
    console.log('DOM Processing:', timing.domComplete - timing.domLoading, 'ms');
  }

  // Memory
  const memory = getMemoryUsage();
  if (memory) {
    console.log('Memory Used:', (memory.used / 1048576).toFixed(2), 'MB');
    console.log('Memory Total:', (memory.total / 1048576).toFixed(2), 'MB');
    console.log('Memory Limit:', (memory.limit / 1048576).toFixed(2), 'MB');
  }

  // Connection
  const connection = (navigator as any).connection;
  if (connection) {
    console.log('Connection Type:', connection.effectiveType);
    console.log('Downlink:', connection.downlink, 'Mbps');
    console.log('RTT:', connection.rtt, 'ms');
  }

  console.groupEnd();
}
