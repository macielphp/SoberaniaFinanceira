import { EventBus } from '../../../clean-architecture/shared/events/EventBus';

describe('Simple Cache Test', () => {
  it('should create EventBus', () => {
    const eventBus = new EventBus();
    expect(eventBus).toBeDefined();
  });

  it('should subscribe and publish events', () => {
    const eventBus = new EventBus();
    const mockHandler = jest.fn();
    
    eventBus.subscribe('test-event', mockHandler);
    eventBus.publish('test-event', { data: 'test' });
    
    expect(mockHandler).toHaveBeenCalledWith({ data: 'test' });
  });
});
