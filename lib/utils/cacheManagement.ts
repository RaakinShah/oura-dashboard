/**
 * Cache management utilities
 */

export interface CacheOptions {
  maxAge?: number; // milliseconds
  maxSize?: number; // number of entries
  staleWhileRevalidate?: boolean;
}

export class MemoryCache<T = any> {
  private cache = new Map<string, { data: T; timestamp: number; size: number }>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxAge: options.maxAge || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      staleWhileRevalidate: options.staleWhileRevalidate || false,
    };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;

    if (age > this.options.maxAge) {
      if (!this.options.staleWhileRevalidate) {
        this.cache.delete(key);
        return null;
      }
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    const size = this.estimateSize(data);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });

    this.enforceMaxSize();
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private enforceMaxSize(): void {
    if (this.cache.size > this.options.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, entries.length - this.options.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats(): {
    size: number;
    totalBytes: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      totalBytes: entries.reduce((sum, entry) => sum + entry.size, 0),
      oldestEntry: Math.min(...entries.map((e) => e.timestamp)),
      newestEntry: Math.max(...entries.map((e) => e.timestamp)),
    };
  }
}

/**
 * Local Storage cache with expiration
 */
export class LocalStorageCache<T = any> {
  private prefix: string;
  private maxAge: number;

  constructor(prefix: string = 'cache_', maxAge: number = 24 * 60 * 60 * 1000) {
    this.prefix = prefix;
    this.maxAge = maxAge;
  }

  get(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      const age = Date.now() - timestamp;

      if (age > this.maxAge) {
        this.delete(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  set(key: string, data: T): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  clearExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        const actualKey = key.slice(this.prefix.length);
        this.get(actualKey); // Will auto-delete if expired
      }
    });
  }
}

/**
 * Request cache with deduplication
 */
export class RequestCache<T = any> {
  private cache = new MemoryCache<T>();
  private pendingRequests = new Map<string, Promise<T>>();

  async fetch(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Make new request
    const promise = fetcher();
    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      this.cache.set(key, data);
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    // Implementation would require storing keys
  }
}

/**
 * Create a memoized version of a function
 */
export function memoizeWithCache<Args extends any[], Result>(
  fn: (...args: Args) => Result,
  options?: CacheOptions
): (...args: Args) => Result {
  const cache = new MemoryCache<Result>(options);

  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Create a memoized async function
 */
export function memoizeAsyncWithCache<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options?: CacheOptions
): (...args: Args) => Promise<Result> {
  const cache = new RequestCache<Result>();

  return (...args: Args): Promise<Result> => {
    const key = JSON.stringify(args);
    return cache.fetch(key, () => fn(...args), options);
  };
}
