export type EventHandler<T = any> = (data: T) => void;

export class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event)!.push(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event: string, data?: any): void {
    const handlers = this.events.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (data) => {
      handler(data);
      this.off(event, onceHandler);
    };

    this.on(event, onceHandler);
  }

  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }
}

export const globalEventEmitter = new EventEmitter();
