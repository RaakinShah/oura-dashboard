/**
 * Web Worker utilities for offloading heavy computations
 */

export interface WorkerTask<T = any, R = any> {
  id: string;
  data: T;
  resolve: (result: R) => void;
  reject: (error: any) => void;
}

/**
 * Create a typed web worker wrapper
 */
export class TypedWorker<TInput = any, TOutput = any> {
  private worker: Worker | null = null;
  private tasks = new Map<string, WorkerTask<TInput, TOutput>>();
  private taskIdCounter = 0;

  constructor(workerScript: string | (() => void)) {
    if (typeof workerScript === 'string') {
      this.worker = new Worker(workerScript);
    } else {
      // Create worker from function
      const blob = new Blob(
        [`(${workerScript.toString()})()`],
        { type: 'application/javascript' }
      );
      const url = URL.createObjectURL(blob);
      this.worker = new Worker(url);
      URL.revokeObjectURL(url);
    }

    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  async run(data: TInput): Promise<TOutput> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const id = `task-${++this.taskIdCounter}`;
      this.tasks.set(id, { id, data, resolve, reject });

      this.worker!.postMessage({ id, data });
    });
  }

  private handleMessage(event: MessageEvent): void {
    const { id, result, error } = event.data;
    const task = this.tasks.get(id);

    if (task) {
      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }
      this.tasks.delete(id);
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    this.tasks.forEach((task) => {
      task.reject(error);
    });
    this.tasks.clear();
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.tasks.forEach((task) => {
      task.reject(new Error('Worker terminated'));
    });
    this.tasks.clear();
  }
}

/**
 * Worker pool for parallel processing
 */
export class WorkerPool<TInput = any, TOutput = any> {
  private workers: TypedWorker<TInput, TOutput>[] = [];
  private queue: Array<{
    data: TInput;
    resolve: (result: TOutput) => void;
    reject: (error: any) => void;
  }> = [];
  private activeWorkers = new Set<number>();

  constructor(
    workerScript: string | (() => void),
    poolSize: number = navigator.hardwareConcurrency || 4
  ) {
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new TypedWorker<TInput, TOutput>(workerScript));
    }
  }

  async run(data: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const availableWorkerIndex = this.findAvailableWorker();
    if (availableWorkerIndex === -1) return;

    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers.add(availableWorkerIndex);

    try {
      const result = await this.workers[availableWorkerIndex].run(task.data);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeWorkers.delete(availableWorkerIndex);
      this.processQueue();
    }
  }

  private findAvailableWorker(): number {
    for (let i = 0; i < this.workers.length; i++) {
      if (!this.activeWorkers.has(i)) {
        return i;
      }
    }
    return -1;
  }

  terminate(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.activeWorkers.clear();

    this.queue.forEach((task) => {
      task.reject(new Error('Worker pool terminated'));
    });
    this.queue = [];
  }

  getStats(): {
    poolSize: number;
    activeWorkers: number;
    queuedTasks: number;
  } {
    return {
      poolSize: this.workers.length,
      activeWorkers: this.activeWorkers.size,
      queuedTasks: this.queue.length,
    };
  }
}

/**
 * Create inline worker from function
 */
export function createInlineWorker<TInput, TOutput>(
  fn: (data: TInput) => TOutput
): TypedWorker<TInput, TOutput> {
  const workerFn = () => {
    self.onmessage = (event: MessageEvent) => {
      const { id, data } = event.data;

      try {
        const result = (fn as any)(data);
        (self as any).postMessage({ id, result });
      } catch (error) {
        (self as any).postMessage({
          id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };
  };

  return new TypedWorker<TInput, TOutput>(workerFn);
}

/**
 * Offload heavy computation to worker
 */
export async function offloadComputation<TInput, TOutput>(
  fn: (data: TInput) => TOutput,
  data: TInput
): Promise<TOutput> {
  const worker = createInlineWorker(fn);

  try {
    return await worker.run(data);
  } finally {
    worker.terminate();
  }
}

/**
 * Check if Web Workers are supported
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Estimate if computation should use worker
 */
export function shouldUseWorker(
  estimatedDuration: number,
  threshold: number = 50
): boolean {
  return isWebWorkerSupported() && estimatedDuration > threshold;
}
