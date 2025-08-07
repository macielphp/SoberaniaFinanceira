import { EventBus } from '../../clean-architecture/shared/events/EventBus';

/**
 * Testes de Integração para State Management
 * 
 * Estes testes verificam a integração entre diferentes
 * componentes do sistema de gerenciamento de estado
 */
describe('State Management Integration', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Event System Integration', () => {
    it('should handle operation lifecycle events', () => {
      const mockHandler = jest.fn();
      eventBus.subscribe('OperationCreated', mockHandler);
      eventBus.subscribe('OperationUpdated', mockHandler);
      eventBus.subscribe('OperationDeleted', mockHandler);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      
      // Test create
      eventBus.publish('OperationCreated', operation);
      expect(mockHandler).toHaveBeenCalledWith(operation);

      // Test update
      const updatedOperation = { ...operation, value: 200 };
      eventBus.publish('OperationUpdated', updatedOperation);
      expect(mockHandler).toHaveBeenCalledWith(updatedOperation);

      // Test delete
      eventBus.publish('OperationDeleted', '1');
      expect(mockHandler).toHaveBeenCalledWith('1');
    });

    it('should handle category lifecycle events', () => {
      const mockHandler = jest.fn();
      eventBus.subscribe('CategoryCreated', mockHandler);
      eventBus.subscribe('CategoryUpdated', mockHandler);
      eventBus.subscribe('CategoryDeleted', mockHandler);

      const category = { id: '1', name: 'Alimentação', type: 'expense' };
      
      // Test create
      eventBus.publish('CategoryCreated', category);
      expect(mockHandler).toHaveBeenCalledWith(category);

      // Test update
      const updatedCategory = { ...category, name: 'Alimentação Atualizada' };
      eventBus.publish('CategoryUpdated', updatedCategory);
      expect(mockHandler).toHaveBeenCalledWith(updatedCategory);

      // Test delete
      eventBus.publish('CategoryDeleted', '1');
      expect(mockHandler).toHaveBeenCalledWith('1');
    });

    it('should handle account lifecycle events', () => {
      const mockHandler = jest.fn();
      eventBus.subscribe('AccountCreated', mockHandler);
      eventBus.subscribe('AccountUpdated', mockHandler);
      eventBus.subscribe('AccountDeleted', mockHandler);

      const account = { id: '1', name: 'Conta Corrente', type: 'corrente' };
      
      // Test create
      eventBus.publish('AccountCreated', account);
      expect(mockHandler).toHaveBeenCalledWith(account);

      // Test update
      const updatedAccount = { ...account, name: 'Conta Atualizada' };
      eventBus.publish('AccountUpdated', updatedAccount);
      expect(mockHandler).toHaveBeenCalledWith(updatedAccount);

      // Test delete
      eventBus.publish('AccountDeleted', '1');
      expect(mockHandler).toHaveBeenCalledWith('1');
    });
  });

  describe('State Synchronization', () => {
    it('should synchronize state across multiple listeners', () => {
      const listeners: any[] = [];
      const operations: any[] = [];

      // Create multiple listeners
      for (let i = 0; i < 3; i++) {
        const listener = {
          operations: [],
          handleOperationCreated: function(operation: any) {
            this.operations.push(operation);
          }
        };
        listeners.push(listener);
        eventBus.subscribe('OperationCreated', listener.handleOperationCreated.bind(listener));
      }

      // Add operations
      const operation1 = { id: '1', nature: 'despesa', value: 100 };
      const operation2 = { id: '2', nature: 'receita', value: 200 };

      eventBus.publish('OperationCreated', operation1);
      eventBus.publish('OperationCreated', operation2);

      // Verify all listeners have the same state
      listeners.forEach(listener => {
        expect(listener.operations).toHaveLength(2);
        expect(listener.operations).toContainEqual(operation1);
        expect(listener.operations).toContainEqual(operation2);
      });
    });

    it('should handle state updates correctly', () => {
      const state = {
        operations: [],
        categories: [],
        accounts: []
      };

      const updateState = (eventName: string, data: any) => {
        switch (eventName) {
          case 'OperationCreated':
            state.operations.push(data);
            break;
          case 'CategoryCreated':
            state.categories.push(data);
            break;
          case 'AccountCreated':
            state.accounts.push(data);
            break;
        }
      };

      // Subscribe to all events
      eventBus.subscribe('OperationCreated', (data) => updateState('OperationCreated', data));
      eventBus.subscribe('CategoryCreated', (data) => updateState('CategoryCreated', data));
      eventBus.subscribe('AccountCreated', (data) => updateState('AccountCreated', data));

      // Add data
      const operation = { id: '1', nature: 'despesa', value: 100 };
      const category = { id: '1', name: 'Alimentação', type: 'expense' };
      const account = { id: '1', name: 'Conta Corrente', type: 'corrente' };

      eventBus.publish('OperationCreated', operation);
      eventBus.publish('CategoryCreated', category);
      eventBus.publish('AccountCreated', account);

      // Verify state
      expect(state.operations).toHaveLength(1);
      expect(state.categories).toHaveLength(1);
      expect(state.accounts).toHaveLength(1);
      expect(state.operations[0]).toEqual(operation);
      expect(state.categories[0]).toEqual(category);
      expect(state.accounts[0]).toEqual(account);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', () => {
      const errorHandler = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Create a handler that throws an error
      const failingHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      eventBus.subscribe('OperationCreated', failingHandler);
      eventBus.subscribe('error', errorHandler);

      // Publish event - should not crash
      const operation = { id: '1', nature: 'despesa', value: 100 };
      expect(() => {
        eventBus.publish('OperationCreated', operation);
      }).not.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should continue processing other handlers when one fails', () => {
      const workingHandler = jest.fn();
      const failingHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      eventBus.subscribe('OperationCreated', failingHandler);
      eventBus.subscribe('OperationCreated', workingHandler);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      eventBus.publish('OperationCreated', operation);

      // Verify working handler was called despite the error
      expect(workingHandler).toHaveBeenCalledWith(operation);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle high volume of events efficiently', () => {
      const handler = jest.fn();
      eventBus.subscribe('OperationCreated', handler);

      const startTime = Date.now();
      const operations = [];

      // Create 1000 operations
      for (let i = 0; i < 1000; i++) {
        operations.push({ id: i.toString(), nature: 'despesa', value: i });
      }

      // Publish all operations
      operations.forEach(operation => {
        eventBus.publish('OperationCreated', operation);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all operations were processed
      expect(handler).toHaveBeenCalledTimes(1000);
      
      // Verify performance (should complete in reasonable time)
      expect(duration).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle multiple subscribers efficiently', () => {
      const handlers = [];
      const numHandlers = 100;

      // Create 100 handlers
      for (let i = 0; i < numHandlers; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventBus.subscribe('OperationCreated', handler);
      }

      const operation = { id: '1', nature: 'despesa', value: 100 };
      const startTime = Date.now();

      eventBus.publish('OperationCreated', operation);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all handlers were called
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledWith(operation);
      });

      // Verify performance
      expect(duration).toBeLessThan(100); // Less than 100ms
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with multiple subscriptions', () => {
      const handlers = [];
      const numHandlers = 50;

      // Create handlers and subscribe
      for (let i = 0; i < numHandlers; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventBus.subscribe('OperationCreated', handler);
      }

      // Publish events
      for (let i = 0; i < 100; i++) {
        eventBus.publish('OperationCreated', { id: i.toString(), nature: 'despesa', value: i });
      }

      // Verify all handlers were called
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(100);
      });

      // Test unsubscribe
      const handlerToUnsubscribe = handlers[0];
      eventBus.unsubscribe('OperationCreated', handlerToUnsubscribe);

      // Publish one more event
      eventBus.publish('OperationCreated', { id: 'test', nature: 'despesa', value: 999 });

      // Verify unsubscribed handler was not called
      expect(handlerToUnsubscribe).toHaveBeenCalledTimes(100); // Should not have been called for the last event

      // Verify other handlers were still called
      handlers.slice(1).forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(101); // Should have been called for all events including the last one
      });
    });
  });
});
