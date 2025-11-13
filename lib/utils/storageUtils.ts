export const storage = {
  get(key: string, defaultValue?: any): any {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item "${key}" from storage:`, error);
      return defaultValue;
    }
  },

  set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item "${key}" in storage:`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from storage:`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  },
};

export const sessionStorage = {
  get(key: string, defaultValue?: any): any {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item "${key}" from session storage:`, error);
      return defaultValue;
    }
  },

  set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item "${key}" in session storage:`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from session storage:`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  },
};
