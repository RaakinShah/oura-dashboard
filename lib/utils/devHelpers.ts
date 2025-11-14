/**
 * Development helper utilities
 */

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function debugLog(category: string, ...args: any[]): void {
  if (isDevelopment()) {
    console.log(`[${category}]`, ...args);
  }
}

export function measureRender(componentName: string) {
  if (!isDevelopment()) return { start: () => {}, end: () => {} };

  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const duration = performance.now() - startTime;
      if (duration > 16) {
        console.warn(`[Slow Render] ${componentName}: ${duration.toFixed(2)}ms`);
      }
    },
  };
}

export function validateEnvironment(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export function getBuildInfo() {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV,
    commit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'unknown',
  };
}

export class NetworkLogger {
  private requests: Array<{
    url: string;
    method: string;
    timestamp: number;
    duration?: number;
  }> = [];

  log(url: string, method: string) {
    const request: { url: string; method: string; timestamp: number; duration?: number } = {
      url,
      method,
      timestamp: Date.now(),
    };
    this.requests.push(request);
    return () => {
      request.duration = Date.now() - request.timestamp;
    };
  }

  getRequests() {
    return this.requests;
  }
}
