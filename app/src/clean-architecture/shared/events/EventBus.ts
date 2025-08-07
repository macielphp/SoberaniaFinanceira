export type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to an event
   * @param eventName - Name of the event to subscribe to
   * @param handler - Function to be called when event is published
   */
  subscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    const handlers = this.handlers.get(eventName)!;
    
    // Avoid duplicate handlers
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event to unsubscribe from
   * @param handler - Function to remove from event handlers
   */
  unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      
      // Remove event if no handlers left
      if (handlers.length === 0) {
        this.handlers.delete(eventName);
      }
    }
  }

  /**
   * Publish an event to all subscribed handlers
   * @param eventName - Name of the event to publish
   * @param data - Data to pass to event handlers
   */
  publish<T = any>(eventName: string, data?: T): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Clear all event handlers or handlers for a specific event
   * @param eventName - Optional event name to clear specific handlers
   */
  clear(eventName?: string): void {
    if (eventName) {
      this.handlers.delete(eventName);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get the number of handlers for a specific event
   * @param eventName - Name of the event
   * @returns Number of handlers for the event
   */
  getHandlerCount(eventName: string): number {
    const handlers = this.handlers.get(eventName);
    return handlers ? handlers.length : 0;
  }

  /**
   * Check if an event has any handlers
   * @param eventName - Name of the event
   * @returns True if event has handlers, false otherwise
   */
  hasHandlers(eventName: string): boolean {
    return this.getHandlerCount(eventName) > 0;
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }
} 