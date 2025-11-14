/**
 * Data transformation utilities
 */

/**
 * Transform data shape (flatten nested objects)
 */
export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Unflatten object (reverse of flatten)
 */
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const keys = key.split('.');
    let current = result;

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = obj[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  });

  return result;
}

/**
 * Map object keys
 */
export function mapKeys<T extends Record<string, any>>(
  obj: T,
  mapper: Record<keyof T, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const newKey = mapper[key as keyof T] || key;
    result[newKey] = obj[key];
  });

  return result;
}

/**
 * Pick specific fields from objects
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Omit specific fields from objects
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };

  keys.forEach((key) => {
    delete result[key];
  });

  return result as Omit<T, K>;
}

/**
 * Transform array to object using key function
 */
export function arrayToObject<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> {
  const result: Record<string, T> = {};

  array.forEach((item) => {
    const key = keyFn(item);
    result[key] = item;
  });

  return result;
}

/**
 * Transform object to array using mapper
 */
export function objectToArray<T, R>(
  obj: Record<string, T>,
  mapper: (key: string, value: T) => R
): R[] {
  return Object.keys(obj).map((key) => mapper(key, obj[key]));
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  const clonedObj = {} as T;
  Object.keys(obj).forEach((key) => {
    clonedObj[key as keyof T] = deepClone((obj as any)[key]);
  });

  return clonedObj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const source = sources.shift();
  if (!source) return target;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) {
          (target as any)[key] = {};
        }
        deepMerge(target[key], source[key] as any);
      } else {
        (target as any)[key] = source[key];
      }
    });
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Sort array by multiple fields
 */
export function multiSort<T extends Record<string, any>>(
  data: T[],
  sortBy: Array<{ field: keyof T; order: 'asc' | 'desc' }>
): T[] {
  return [...data].sort((a, b) => {
    for (const sort of sortBy) {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      if (aVal !== bVal) {
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.order === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Unique array by key
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Transpose 2D array (rows to columns)
 */
export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
