/**
 * Memory leak detection utilities
 */

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private interval: NodeJS.Timeout | null = null;
  private listeners: Array<(snapshot: MemorySnapshot) => void> = [];

  start(intervalMs: number = 5000): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const snapshot = this.takeSnapshot();
      if (snapshot) {
        this.snapshots.push(snapshot);
        this.listeners.forEach((listener) => listener(snapshot));

        // Keep only last 100 snapshots
        if (this.snapshots.length > 100) {
          this.snapshots.shift();
        }

        // Detect leak
        if (this.detectLeak()) {
          console.warn('[Memory Leak Detected]', this.getLeakReport());
        }
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  takeSnapshot(): MemorySnapshot | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: 0,
      };
    }
    return null;
  }

  detectLeak(): boolean {
    if (this.snapshots.length < 10) return false;

    const recent = this.snapshots.slice(-10);
    const trend = this.calculateTrend(recent.map((s) => s.heapUsed));

    // Consistent growth over 10 snapshots indicates potential leak
    return trend > 0.1 && recent[recent.length - 1].heapUsed > recent[0].heapUsed * 1.5;
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }

    return numerator / denominator;
  }

  getLeakReport(): {
    growthRate: number;
    currentUsage: number;
    peakUsage: number;
    averageUsage: number;
  } {
    if (this.snapshots.length === 0) {
      return { growthRate: 0, currentUsage: 0, peakUsage: 0, averageUsage: 0 };
    }

    const heapValues = this.snapshots.map((s) => s.heapUsed);
    const growthRate = this.calculateTrend(heapValues);
    const currentUsage = heapValues[heapValues.length - 1];
    const peakUsage = Math.max(...heapValues);
    const averageUsage = heapValues.reduce((sum, val) => sum + val, 0) / heapValues.length;

    return {
      growthRate,
      currentUsage,
      peakUsage,
      averageUsage,
    };
  }

  onSnapshot(listener: (snapshot: MemorySnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  clear(): void {
    this.snapshots = [];
  }
}

/**
 * Detect event listener leaks
 */
export class EventListenerTracker {
  private listeners = new Map<string, number>();

  track(element: HTMLElement | Window | Document, event: string): void {
    const key = `${element.constructor.name}:${event}`;
    this.listeners.set(key, (this.listeners.get(key) || 0) + 1);
  }

  untrack(element: HTMLElement | Window | Document, event: string): void {
    const key = `${element.constructor.name}:${event}`;
    const count = this.listeners.get(key) || 0;
    if (count > 1) {
      this.listeners.set(key, count - 1);
    } else {
      this.listeners.delete(key);
    }
  }

  getLeaks(threshold: number = 10): Array<{ type: string; count: number }> {
    const leaks: Array<{ type: string; count: number }> = [];

    this.listeners.forEach((count, type) => {
      if (count > threshold) {
        leaks.push({ type, count });
      }
    });

    return leaks.sort((a, b) => b.count - a.count);
  }

  clear(): void {
    this.listeners.clear();
  }
}

/**
 * Detect timer leaks
 */
export class TimerTracker {
  private timers = new Set<number>();

  trackTimeout(id: number): void {
    this.timers.add(id);
  }

  clearTimeout(id: number): void {
    this.timers.delete(id);
  }

  trackInterval(id: number): void {
    this.timers.add(id);
  }

  clearInterval(id: number): void {
    this.timers.delete(id);
  }

  getActiveTimers(): number {
    return this.timers.size;
  }

  clearAll(): void {
    this.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    this.timers.clear();
  }
}

/**
 * Detect DOM node leaks
 */
export function detectDetachedNodes(): number {
  if (typeof window === 'undefined') return 0;

  // This is a simplified detection
  // In real implementation, you'd use Chrome DevTools Protocol
  const all = document.querySelectorAll('*');
  let detached = 0;

  all.forEach((node) => {
    if (!document.contains(node)) {
      detached++;
    }
  });

  return detached;
}

/**
 * Monitor component lifecycle for leaks
 */
export function monitorComponentLifecycle(componentName: string) {
  let mountCount = 0;
  let unmountCount = 0;

  return {
    onMount: () => {
      mountCount++;
      console.log(`[${componentName}] Mounted (total: ${mountCount - unmountCount})`);
    },
    onUnmount: () => {
      unmountCount++;
      console.log(`[${componentName}] Unmounted (total: ${mountCount - unmountCount})`);
    },
    getStats: () => ({
      mounted: mountCount,
      unmounted: unmountCount,
      active: mountCount - unmountCount,
    }),
  };
}
