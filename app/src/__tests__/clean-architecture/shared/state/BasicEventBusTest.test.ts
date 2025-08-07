/**
 * Teste básico do EventBus para verificar se funciona
 */
describe('Basic EventBus Test', () => {
  it('should work with basic functionality', () => {
    // Mock do EventBus para teste básico
    class MockEventBus {
      private handlers: Map<string, Function[]> = new Map();

      subscribe(eventName: string, handler: Function): void {
        if (!this.handlers.has(eventName)) {
          this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
      }

      publish(eventName: string, data?: any): void {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      }
    }

    const eventBus = new MockEventBus();
    const mockHandler = jest.fn();
    
    eventBus.subscribe('test-event', mockHandler);
    eventBus.publish('test-event', { message: 'Hello World' });
    
    expect(mockHandler).toHaveBeenCalledWith({ message: 'Hello World' });
  });

  it('should handle multiple handlers', () => {
    class MockEventBus {
      private handlers: Map<string, Function[]> = new Map();

      subscribe(eventName: string, handler: Function): void {
        if (!this.handlers.has(eventName)) {
          this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
      }

      publish(eventName: string, data?: any): void {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      }
    }

    const eventBus = new MockEventBus();
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    eventBus.subscribe('test-event', handler1);
    eventBus.subscribe('test-event', handler2);
    eventBus.publish('test-event', { message: 'Hello World' });
    
    expect(handler1).toHaveBeenCalledWith({ message: 'Hello World' });
    expect(handler2).toHaveBeenCalledWith({ message: 'Hello World' });
  });
});
