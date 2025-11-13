import { lazy, ComponentType, LazyExoticComponent } from 'react';

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3,
  delay: number = 1000
): LazyExoticComponent<T> {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Failed to load component');
  });
}

export function lazyWithPreload<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  let Component: LazyExoticComponent<T> | null = null;
  let loadingPromise: Promise<{ default: T }> | null = null;

  const load = () => {
    if (!loadingPromise) {
      loadingPromise = importFn();
    }
    return loadingPromise;
  };

  const LazyComponent = lazy(load);

  return {
    Component: LazyComponent,
    preload: load,
  };
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(preloadImage));
}

export async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

export async function loadStyle(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
    document.head.appendChild(link);
  });
}

export class LazyLoader {
  private loadingPromises: Map<string, Promise<any>> = new Map();

  async load<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }

    const promise = loader();
    this.loadingPromises.set(key, promise);

    try {
      const result = await promise;
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  isLoading(key: string): boolean {
    return this.loadingPromises.has(key);
  }

  clear(key?: string) {
    if (key) {
      this.loadingPromises.delete(key);
    } else {
      this.loadingPromises.clear();
    }
  }
}
