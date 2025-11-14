/**
 * LocalStorage helpers for persisting data
 */

const STORAGE_KEYS = {
  OURA_TOKEN: 'oura_access_token',
  CACHE_PREFIX: 'oura_cache_',
} as const;

export const storage = {
  // Token management
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.OURA_TOKEN, token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.OURA_TOKEN);
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.OURA_TOKEN);
    }
  },

  // Cache management
  setCache<T>(key: string, data: T, ttlMinutes: number = 60): void {
    if (typeof window !== 'undefined') {
      try {
        const item = {
          data,
          expiry: Date.now() + ttlMinutes * 60 * 1000,
        };
        localStorage.setItem(
          `${STORAGE_KEYS.CACHE_PREFIX}${key}`,
          JSON.stringify(item)
        );
      } catch (error) {
        // Handle QuotaExceededError or other localStorage errors
        console.warn('Failed to set cache:', error);
      }
    }
  },

  getCache<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
      if (!item) return null;

      try {
        const parsed = JSON.parse(item);
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
          return null;
        }
        return parsed.data;
      } catch {
        return null;
      }
    }
    return null;
  },

  clearCache(): void {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_KEYS.CACHE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    }
  },
};
