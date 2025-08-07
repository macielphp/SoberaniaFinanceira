import { ApplicationStore } from '../../../clean-architecture/shared/state/ApplicationStore';
import { EventBus } from '../../../clean-architecture/shared/events/EventBus';

describe('ApplicationStore with Cache', () => {
  let applicationStore: ApplicationStore;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    applicationStore = new ApplicationStore(eventBus);
  });

  afterEach(() => {
    applicationStore.stop();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const state = applicationStore.getState();
      
      expect(state.operations).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.accounts).toEqual([]);
      expect(state.goals).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.lastUpdated).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should update state correctly', () => {
      const newState = {
        operations: [{ id: '1', nature: 'despesa', value: 100 }],
        loading: true,
      };

      applicationStore.setState(newState);
      const state = applicationStore.getState();

      expect(state.operations).toEqual(newState.operations);
      expect(state.loading).toBe(true);
      expect(state.lastUpdated).toBeGreaterThan(0);
    });

    it('should notify listeners when state changes', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      applicationStore.setState({ loading: true });

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({ loading: true })
      );
    });

    it('should return unsubscribe function', () => {
      const mockListener = jest.fn();
      const unsubscribe = applicationStore.subscribe(mockListener);

      applicationStore.setState({ loading: true });
      expect(mockListener).toHaveBeenCalledTimes(1);

      unsubscribe();
      applicationStore.setState({ loading: false });
      expect(mockListener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      applicationStore.setLoading(true);
      expect(applicationStore.getState().loading).toBe(true);

      applicationStore.setLoading(false);
      expect(applicationStore.getState().loading).toBe(false);
    });

    it('should set error state', () => {
      applicationStore.setError('Test error');
      expect(applicationStore.getState().error).toBe('Test error');

      applicationStore.clearError();
      expect(applicationStore.getState().error).toBe(null);
    });
  });

  describe('Event Handling', () => {
    it('should handle OperationCreated event', () => {
      const operation = { id: '1', nature: 'despesa', value: 100 };
      
      eventBus.publish('OperationCreated', operation);
      
      const state = applicationStore.getState();
      expect(state.operations).toContainEqual(operation);
    });

    it('should handle OperationUpdated event', () => {
      const originalOperation = { id: '1', nature: 'despesa', value: 100 };
      const updatedOperation = { id: '1', nature: 'despesa', value: 200 };
      
      // Add original operation
      eventBus.publish('OperationCreated', originalOperation);
      
      // Update operation
      eventBus.publish('OperationUpdated', updatedOperation);
      
      const state = applicationStore.getState();
      expect(state.operations).toContainEqual(updatedOperation);
      expect(state.operations).not.toContainEqual(originalOperation);
    });

    it('should handle OperationDeleted event', () => {
      const operation = { id: '1', nature: 'despesa', value: 100 };
      
      // Add operation
      eventBus.publish('OperationCreated', operation);
      
      // Delete operation
      eventBus.publish('OperationDeleted', '1');
      
      const state = applicationStore.getState();
      expect(state.operations).not.toContainEqual(operation);
    });

    it('should handle CategoryCreated event', () => {
      const category = { id: '1', name: 'Alimentação', type: 'expense' };
      
      eventBus.publish('CategoryCreated', category);
      
      const state = applicationStore.getState();
      expect(state.categories).toContainEqual(category);
    });

    it('should handle AccountCreated event', () => {
      const account = { id: '1', name: 'Conta Corrente', type: 'corrente' };
      
      eventBus.publish('AccountCreated', account);
      
      const state = applicationStore.getState();
      expect(state.accounts).toContainEqual(account);
    });

    it('should handle GoalCreated event', () => {
      const goal = { id: '1', name: 'Viagem', targetAmount: 5000 };
      
      eventBus.publish('GoalCreated', goal);
      
      const state = applicationStore.getState();
      expect(state.goals).toContainEqual(goal);
    });
  });

  describe('Cache Integration', () => {
    it('should provide cache manager', () => {
      const cacheManager = applicationStore.getCacheManager();
      expect(cacheManager).toBeDefined();
    });

    it('should get cached data', () => {
      const testData = { id: '1', name: 'Test' };
      applicationStore.setCachedData('test-domain', { id: '1' }, testData);
      
      const result = applicationStore.getCachedData('test-domain', { id: '1' });
      expect(result).toEqual(testData);
    });

    it('should check if data exists in cache', () => {
      expect(applicationStore.hasCachedData('test-domain', { id: '1' })).toBe(false);
      
      applicationStore.setCachedData('test-domain', { id: '1' }, { data: 'test' });
      expect(applicationStore.hasCachedData('test-domain', { id: '1' })).toBe(true);
    });

    it('should invalidate cache domain', () => {
      applicationStore.setCachedData('operations', { id: '1' }, { data: 'op1' });
      applicationStore.setCachedData('categories', { id: '1' }, { data: 'cat1' });
      
      expect(applicationStore.hasCachedData('operations', { id: '1' })).toBe(true);
      expect(applicationStore.hasCachedData('categories', { id: '1' })).toBe(true);
      
      applicationStore.invalidateCache('operations');
      
      expect(applicationStore.hasCachedData('operations', { id: '1' })).toBe(false);
      expect(applicationStore.hasCachedData('categories', { id: '1' })).toBe(true);
    });

    it('should get cache statistics', () => {
      const stats = applicationStore.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('missRate');
    });

    it('should clear cache', () => {
      applicationStore.setCachedData('test-domain', { id: '1' }, { data: 'test' });
      expect(applicationStore.hasCachedData('test-domain', { id: '1' })).toBe(true);
      
      applicationStore.clearCache();
      expect(applicationStore.hasCachedData('test-domain', { id: '1' })).toBe(false);
    });
  });

  describe('Cache Invalidation on Events', () => {
    it('should invalidate operations cache on operation events', () => {
      applicationStore.setCachedData('operations', { id: '1' }, { data: 'op1' });
      applicationStore.setCachedData('financial-summary', {}, { total: 1000 });
      
      expect(applicationStore.hasCachedData('operations', { id: '1' })).toBe(true);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(true);
      
      eventBus.publish('OperationCreated', { id: 'new-op' });
      
      expect(applicationStore.hasCachedData('operations', { id: '1' })).toBe(false);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(false);
    });

    it('should invalidate categories cache on category events', () => {
      applicationStore.setCachedData('categories', { id: '1' }, { data: 'cat1' });
      applicationStore.setCachedData('financial-summary', {}, { total: 1000 });
      
      expect(applicationStore.hasCachedData('categories', { id: '1' })).toBe(true);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(true);
      
      eventBus.publish('CategoryCreated', { id: 'new-cat' });
      
      expect(applicationStore.hasCachedData('categories', { id: '1' })).toBe(false);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(false);
    });

    it('should invalidate accounts cache on account events', () => {
      applicationStore.setCachedData('accounts', { id: '1' }, { data: 'acc1' });
      applicationStore.setCachedData('financial-summary', {}, { total: 1000 });
      
      expect(applicationStore.hasCachedData('accounts', { id: '1' })).toBe(true);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(true);
      
      eventBus.publish('AccountCreated', { id: 'new-acc' });
      
      expect(applicationStore.hasCachedData('accounts', { id: '1' })).toBe(false);
      expect(applicationStore.hasCachedData('financial-summary', {})).toBe(false);
    });

    it('should invalidate goals cache on goal events', () => {
      applicationStore.setCachedData('goals', { id: '1' }, { data: 'goal1' });
      
      expect(applicationStore.hasCachedData('goals', { id: '1' })).toBe(true);
      
      eventBus.publish('GoalCreated', { id: 'new-goal' });
      
      expect(applicationStore.hasCachedData('goals', { id: '1' })).toBe(false);
    });
  });

  describe('Lifecycle', () => {
    it('should stop cache manager on stop', () => {
      expect(() => applicationStore.stop()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid state updates', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      // Multiple rapid updates
      applicationStore.setState({ loading: true });
      applicationStore.setState({ loading: false });
      applicationStore.setState({ error: 'test' });

      expect(mockListener).toHaveBeenCalledTimes(3);
    });

    it('should handle empty state updates', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      applicationStore.setState({});

      expect(mockListener).toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();

      applicationStore.subscribe(mockListener1);
      applicationStore.subscribe(mockListener2);

      applicationStore.setState({ loading: true });

      expect(mockListener1).toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalled();
    });
  });
});
