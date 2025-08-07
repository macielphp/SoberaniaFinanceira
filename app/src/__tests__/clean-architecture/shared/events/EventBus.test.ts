import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('subscribe', () => {
    it('should subscribe to an event', () => {
      const handler = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler);

      expect(eventBus['handlers'].has(eventName)).toBe(true);
      expect(eventBus['handlers'].get(eventName)).toContain(handler);
    });

    it('should allow multiple handlers for the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler1);
      eventBus.subscribe(eventName, handler2);

      const handlers = eventBus['handlers'].get(eventName);
      expect(handlers).toContain(handler1);
      expect(handlers).toContain(handler2);
      expect(handlers).toHaveLength(2);
    });

    it('should not add duplicate handlers', () => {
      const handler = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler);
      eventBus.subscribe(eventName, handler);

      const handlers = eventBus['handlers'].get(eventName);
      expect(handlers).toContain(handler);
      expect(handlers).toHaveLength(1);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from an event', () => {
      const handler = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler);
      eventBus.unsubscribe(eventName, handler);

      // When the last handler is removed, the event is deleted from the Map
      expect(eventBus['handlers'].has(eventName)).toBe(false);
    });

    it('should remove only the specified handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler1);
      eventBus.subscribe(eventName, handler2);
      eventBus.unsubscribe(eventName, handler1);

      const handlers = eventBus['handlers'].get(eventName);
      expect(handlers).not.toContain(handler1);
      expect(handlers).toContain(handler2);
      expect(handlers).toHaveLength(1);
    });

    it('should do nothing when unsubscribing from non-existent event', () => {
      const handler = jest.fn();
      const eventName = 'non-existent-event';

      expect(() => {
        eventBus.unsubscribe(eventName, handler);
      }).not.toThrow();
    });

    it('should do nothing when unsubscribing non-existent handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler1);
      eventBus.unsubscribe(eventName, handler2);

      const handlers = eventBus['handlers'].get(eventName);
      expect(handlers).toContain(handler1);
      expect(handlers).toHaveLength(1);
    });
  });

  describe('publish', () => {
    it('should publish event to all subscribed handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventName = 'test-event';
      const eventData = { message: 'test' };

      eventBus.subscribe(eventName, handler1);
      eventBus.subscribe(eventName, handler2);
      eventBus.publish(eventName, eventData);

      expect(handler1).toHaveBeenCalledWith(eventData);
      expect(handler2).toHaveBeenCalledWith(eventData);
    });

    it('should not call handlers for non-existent event', () => {
      const handler = jest.fn();
      const eventName = 'non-existent-event';
      const eventData = { message: 'test' };

      eventBus.subscribe('other-event', handler);
      eventBus.publish(eventName, eventData);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle events with no data', () => {
      const handler = jest.fn();
      const eventName = 'test-event';

      eventBus.subscribe(eventName, handler);
      eventBus.publish(eventName);

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('should handle multiple events independently', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event1 = 'event-1';
      const event2 = 'event-2';
      const data1 = { message: 'test1' };
      const data2 = { message: 'test2' };

      eventBus.subscribe(event1, handler1);
      eventBus.subscribe(event2, handler2);

      eventBus.publish(event1, data1);
      eventBus.publish(event2, data2);

      expect(handler1).toHaveBeenCalledWith(data1);
      expect(handler2).toHaveBeenCalledWith(data2);
      expect(handler1).not.toHaveBeenCalledWith(data2);
      expect(handler2).not.toHaveBeenCalledWith(data1);
    });
  });

  describe('clear', () => {
    it('should clear all event handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event1 = 'event-1';
      const event2 = 'event-2';

      eventBus.subscribe(event1, handler1);
      eventBus.subscribe(event2, handler2);
      eventBus.clear();

      expect(eventBus['handlers'].size).toBe(0);
    });

    it('should clear handlers for specific event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event1 = 'event-1';
      const event2 = 'event-2';

      eventBus.subscribe(event1, handler1);
      eventBus.subscribe(event2, handler2);
      eventBus.clear(event1);

      expect(eventBus['handlers'].has(event1)).toBe(false);
      expect(eventBus['handlers'].has(event2)).toBe(true);
    });
  });

  describe('getHandlerCount', () => {
    it('should return correct handler count for event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventName = 'test-event';

      expect(eventBus.getHandlerCount(eventName)).toBe(0);

      eventBus.subscribe(eventName, handler1);
      expect(eventBus.getHandlerCount(eventName)).toBe(1);

      eventBus.subscribe(eventName, handler2);
      expect(eventBus.getHandlerCount(eventName)).toBe(2);
    });

    it('should return 0 for non-existent event', () => {
      expect(eventBus.getHandlerCount('non-existent-event')).toBe(0);
    });
  });
}); 