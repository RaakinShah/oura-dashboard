/**
 * Testing utilities and helpers
 */

/**
 * Generate mock data for testing
 */
export function generateMockData<T>(
  template: () => T,
  count: number
): T[] {
  return Array.from({ length: count }, template);
}

/**
 * Mock sleep data generator
 */
export function generateMockSleepData(count: number = 7) {
  return generateMockData(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: Math.random().toString(36).substr(2, 9),
      date: baseDate.toISOString().split('T')[0],
      total_sleep_duration: Math.floor(Math.random() * 10800 + 21600), // 6-9 hours
      efficiency: Math.floor(Math.random() * 20 + 75), // 75-95%
      restfulness: Math.floor(Math.random() * 30 + 65),
      rem_sleep_duration: Math.floor(Math.random() * 7200 + 3600),
      deep_sleep_duration: Math.floor(Math.random() * 7200 + 3600),
      light_sleep_duration: Math.floor(Math.random() * 10800 + 7200),
      bedtime_start: baseDate.toISOString(),
      bedtime_end: new Date(baseDate.getTime() + 28800000).toISOString(),
    };
  }, count);
}

/**
 * Mock activity data generator
 */
export function generateMockActivityData(count: number = 7) {
  return generateMockData(() => ({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
    steps: Math.floor(Math.random() * 15000 + 3000),
    cal_total: Math.floor(Math.random() * 1000 + 1500),
    cal_active: Math.floor(Math.random() * 500 + 200),
    met_min_medium: Math.floor(Math.random() * 60 + 30),
    met_min_high: Math.floor(Math.random() * 30 + 10),
  }), count);
}

/**
 * Wait for condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Simulate user event
 */
export function simulateEvent(
  element: HTMLElement,
  eventType: string,
  options?: EventInit
): void {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
}

/**
 * Mock fetch response
 */
export function mockFetch(
  url: string,
  response: any,
  options?: { delay?: number; status?: number }
): () => void {
  const originalFetch = global.fetch;
  const { delay = 0, status = 200 } = options || {};

  global.fetch = jest.fn((input) => {
    if (input === url) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(response),
          } as Response);
        }, delay);
      });
    }
    return originalFetch(input);
  }) as any;

  return () => {
    global.fetch = originalFetch;
  };
}

/**
 * Create mock IntersectionObserver
 */
export function mockIntersectionObserver(): void {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(public callback: IntersectionObserverCallback) {}
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
    get root() {
      return null;
    }
    get rootMargin() {
      return '';
    }
    get thresholds() {
      return [];
    }
  } as any;
}

/**
 * Measure function execution time for testing
 */
export async function measurePerformance<T>(
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  return { result, duration };
}

/**
 * Assert deep equality
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => deepEqual(obj1[key], obj2[key]));
}
