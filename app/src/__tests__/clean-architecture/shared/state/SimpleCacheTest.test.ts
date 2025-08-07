import { EventBus } from '@/clean-architecture/shared/events/EventBus';

describe('Simple Cache Test', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should create EventBus instance', () => {
    expect(eventBus).toBeDefined();
    expect(eventBus).toBeInstanceOf(EventBus);
  });

  it('should handle basic event operations', () => {
    const mockHandler = jest.fn();
    eventBus.subscribe('test-event', mockHandler);
    
    const testData = { message: 'Hello World' };
    eventBus.publish('test-event', testData);
    
    expect(mockHandler).toHaveBeenCalledWith(testData);
  });
});
