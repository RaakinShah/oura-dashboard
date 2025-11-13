/**
 * Request batching utilities
 */

export interface BatchOptions {
  maxBatchSize?: number;
  maxWaitTime?: number; // milliseconds
}

/**
 * Batch multiple requests together
 */
export class RequestBatcher<T, R> {
  private queue: Array<{
    input: T;
    resolve: (result: R) => void;
    reject: (error: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;
  private options: Required<BatchOptions>;
  private batchFn: (inputs: T[]) => Promise<R[]>;

  constructor(
    batchFn: (inputs: T[]) => Promise<R[]>,
    options: BatchOptions = {}
  ) {
    this.batchFn = batchFn;
    this.options = {
      maxBatchSize: options.maxBatchSize || 50,
      maxWaitTime: options.maxWaitTime || 10,
    };
  }

  async add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ input, resolve, reject });

      if (this.queue.length >= this.options.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.maxWaitTime);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);
    const inputs = batch.map((item) => item.input);

    try {
      const results = await this.batchFn(inputs);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}

/**
 * Create a batched version of a function
 */
export function createBatchedFunction<T, R>(
  batchFn: (inputs: T[]) => Promise<R[]>,
  options?: BatchOptions
): (input: T) => Promise<R> {
  const batcher = new RequestBatcher(batchFn, options);
  return (input: T) => batcher.add(input);
}

/**
 * Batch API calls to the same endpoint
 */
export class APIBatcher {
  private batchers = new Map<string, RequestBatcher<any, any>>();

  createBatcher<T, R>(
    endpoint: string,
    batchFn: (inputs: T[]) => Promise<R[]>,
    options?: BatchOptions
  ): (input: T) => Promise<R> {
    if (!this.batchers.has(endpoint)) {
      const batcher = new RequestBatcher(batchFn, options);
      this.batchers.set(endpoint, batcher);
    }

    const batcher = this.batchers.get(endpoint)!;
    return (input: T) => batcher.add(input);
  }

  clearBatcher(endpoint: string): void {
    this.batchers.delete(endpoint);
  }

  clearAll(): void {
    this.batchers.clear();
  }
}

/**
 * Debounce multiple calls and batch them
 */
export function debounceAndBatch<T>(
  fn: (items: T[]) => void,
  delay: number = 300
): (item: T) => void {
  let items: T[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return (item: T) => {
    items.push(item);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(items);
      items = [];
      timeout = null;
    }, delay);
  };
}

/**
 * Batch network requests with retry
 */
export async function batchWithRetry<T, R>(
  inputs: T[],
  batchFn: (inputs: T[]) => Promise<R[]>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<R[]> {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await batchFn(inputs);
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
