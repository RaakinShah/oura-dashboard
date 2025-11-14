import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

/**
 * Hook for caching data with time-based invalidation
 * Reduces unnecessary API calls by caching results
 */
export function useDataCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000 } = options; // Default 5 minutes
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  /**
   * Get data from cache if valid
   */
  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);

    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache entry is still valid
    if (age > ttl) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, [ttl]);

  /**
   * Set data in cache
   */
  const set = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Clear specific cache entry
   */
  const clear = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  /**
   * Clear all cache entries
   */
  const clearAll = useCallback(() => {
    cache.current.clear();
  }, []);

  /**
   * Check if cache has valid entry
   */
  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  return {
    get,
    set,
    clear,
    clearAll,
    has,
  };
}

/**
 * Hook for caching with automatic fetching
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { get, set } = useDataCache<T>(options);

  const fetchWithCache = useCallback(async (): Promise<T> => {
    // Check cache first
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    set(key, data);
    return data;
  }, [key, get, set, fetcher]);

  return fetchWithCache;
}
