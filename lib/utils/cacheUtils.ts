export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

export class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl ?? this.defaultTTL);
    
    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export class LRUCache<T = any> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  has(key: string): boolean {
    return this.cache.has(key);
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
}

export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl?: number
): T {
  const cache = new Cache<Awaited<ReturnType<T>>>(ttl);
  
  return (async (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export const globalCache = new Cache();
