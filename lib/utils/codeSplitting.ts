/**
 * Code splitting and dynamic import utilities
 */

import { ComponentType, lazy } from 'react';

export interface LazyLoadOptions {
  delay?: number;
  fallback?: React.ReactNode;
  retries?: number;
  retryDelay?: number;
}

/**
 * Create a lazily loaded component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;

      const tryImport = async () => {
        try {
          const component = await componentImport();
          resolve(component);
        } catch (error) {
          attempts++;

          if (attempts < retries) {
            setTimeout(tryImport, retryDelay * attempts);
          } else {
            reject(error);
          }
        }
      };

      tryImport();
    });
  });
}

/**
 * Preload a lazy component
 */
export function preloadComponent(
  componentImport: () => Promise<any>
): void {
  // Trigger the import
  componentImport();
}

/**
 * Create route-based code splitting
 */
export function createRouteLoader(routes: Record<string, () => Promise<any>>) {
  const preloadedRoutes = new Set<string>();

  return {
    load: (route: string) => {
      const loader = routes[route];
      if (!loader) {
        throw new Error(`Route "${route}" not found`);
      }
      return loader();
    },

    preload: (route: string) => {
      if (preloadedRoutes.has(route)) return;

      const loader = routes[route];
      if (loader) {
        loader();
        preloadedRoutes.add(route);
      }
    },

    preloadMultiple: (routeList: string[]) => {
      routeList.forEach((route) => {
        const loader = routes[route];
        if (loader && !preloadedRoutes.has(route)) {
          loader();
          preloadedRoutes.add(route);
        }
      });
    },
  };
}

/**
 * Prefetch resources based on user behavior
 */
export function prefetchOnHover(
  element: HTMLElement,
  resources: string[]
): () => void {
  const handleMouseEnter = () => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  };

  element.addEventListener('mouseenter', handleMouseEnter, { once: true });

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
  };
}

/**
 * Prefetch on viewport entry
 */
export function prefetchOnVisible(
  element: HTMLElement,
  resources: string[]
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          resources.forEach((resource) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
          });

          observer.disconnect();
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}

/**
 * Check if module is already loaded
 */
export function isModuleLoaded(moduleName: string): boolean {
  // This is a simplified check
  return typeof (window as any)[moduleName] !== 'undefined';
}

/**
 * Load external script dynamically
 */
export function loadScript(
  src: string,
  options: {
    async?: boolean;
    defer?: boolean;
    module?: boolean;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;

    if (options.async) script.async = true;
    if (options.defer) script.defer = true;
    if (options.module) script.type = 'module';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
}

/**
 * Load CSS dynamically
 */
export function loadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

    document.head.appendChild(link);
  });
}
