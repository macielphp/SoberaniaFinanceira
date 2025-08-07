import { EventBus } from '@/clean-architecture/shared/events/EventBus';

describe('Simple EventBus Test', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should create EventBus instance', () => {
    expect(eventBus).toBeDefined();
    expect(eventBus).toBeInstanceOf(EventBus);
  });

  it('should subscribe and publish events', () => {
    const mockHandler = jest.fn();
    eventBus.subscribe('test-event', mockHandler);
    
    const testData = { message: 'Hello World' };
    eventBus.publish('test-event', testData);
    
    expect(mockHandler).toHaveBeenCalledWith(testData);
  });

  it('should handle multiple handlers for same event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    eventBus.subscribe('test-event', handler1);
    eventBus.subscribe('test-event', handler2);
    
    const testData = { message: 'Hello World' };
    eventBus.publish('test-event', testData);
    
    expect(handler1).toHaveBeenCalledWith(testData);
    expect(handler2).toHaveBeenCalledWith(testData);
  });

  it('should unsubscribe handlers', () => {
    const handler = jest.fn();
    eventBus.subscribe('test-event', handler);
    eventBus.unsubscribe('test-event', handler);
    
    const testData = { message: 'Hello World' };
    eventBus.publish('test-event', testData);
    
    expect(handler).not.toHaveBeenCalled();
  });
});
