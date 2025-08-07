import { ApplicationStore } from '../../../../clean-architecture/shared/state/ApplicationStore';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('ApplicationStore', () => {
  let store: ApplicationStore;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      clear: jest.fn(),
      getHandlerCount: jest.fn(),
      hasHandlers: jest.fn(),
      getEventNames: jest.fn(),
    } as unknown as jest.Mocked<EventBus>;

    store = new ApplicationStore(mockEventBus);
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const state = store.getState();
      
      expect(state.operations).toEqual([]);
      expect(state.accounts).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.goals).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.selectedPeriod).toBe('all');
      expect(state.includeVariableIncome).toBe(false);
    });

    it('should subscribe to domain events on initialization', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('OperationCreated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('OperationUpdated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('OperationDeleted', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('AccountCreated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('AccountUpdated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('AccountDeleted', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('CategoryCreated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('CategoryUpdated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('CategoryDeleted', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('GoalCreated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('GoalUpdated', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('GoalDeleted', expect.any(Function));
    });
  });

  describe('state management', () => {
    it('should update state and notify listeners', () => {
      const mockListener = jest.fn();
      store.subscribe(mockListener);

      const newOperations = [
        new Operation({
          id: 'op1',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date('2024-01-01'),
          value: new Money(1000, 'BRL'),
          category: 'salary',
          createdAt: new Date(),
        })
      ];

      store.setState({ operations: newOperations });

      expect(store.getState().operations).toEqual(newOperations);
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        operations: newOperations
      }));
    });

    it('should handle partial state updates', () => {
      const mockListener = jest.fn();
      store.subscribe(mockListener);

      store.setState({ loading: true, error: 'Test error' });

      const state = store.getState();
      expect(state.loading).toBe(true);
      expect(state.error).toBe('Test error');
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        loading: true,
        error: 'Test error'
      }));
    });

    it('should unsubscribe listeners', () => {
      const mockListener = jest.fn();
      const unsubscribe = store.subscribe(mockListener);

      store.setState({ loading: true });
      expect(mockListener).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.setState({ loading: false });
      expect(mockListener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('event handling', () => {
    it('should handle OperationCreated event', () => {
      const operation = new Operation({
        id: 'op1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'main',
        destinationAccount: 'main',
        date: new Date('2024-01-01'),
        value: new Money(1000, 'BRL'),
        category: 'salary',
        createdAt: new Date(),
      });

      const event = DomainEventFactory.createOperationCreated(operation);
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'OperationCreated'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.operations).toContainEqual(operation);
    });

    it('should handle OperationUpdated event', () => {
      const originalOperation = new Operation({
        id: 'op1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'main',
        destinationAccount: 'main',
        date: new Date('2024-01-01'),
        value: new Money(1000, 'BRL'),
        category: 'salary',
        createdAt: new Date(),
      });

      const updatedOperation = new Operation({
        id: 'op1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'main',
        destinationAccount: 'main',
        date: new Date('2024-01-01'),
        value: new Money(1500, 'BRL'),
        category: 'salary',
        createdAt: new Date(),
      });

      // Add original operation to state
      store.setState({ operations: [originalOperation] });

      const event = DomainEventFactory.createOperationUpdated(updatedOperation);
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'OperationUpdated'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.operations).toContainEqual(updatedOperation);
      expect(state.operations).not.toContainEqual(originalOperation);
    });

    it('should handle OperationDeleted event', () => {
      const operation = new Operation({
        id: 'op1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'main',
        destinationAccount: 'main',
        date: new Date('2024-01-01'),
        value: new Money(1000, 'BRL'),
        category: 'salary',
        createdAt: new Date(),
      });

      // Add operation to state
      store.setState({ operations: [operation] });

      const event = DomainEventFactory.createOperationDeleted('op1');
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'OperationDeleted'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.operations).toEqual([]);
    });

    it('should handle AccountCreated event', () => {
      const account = new Account({
        id: 'acc1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(5000, 'BRL'),
        createdAt: new Date(),
      });

      const event = DomainEventFactory.createAccountCreated(account);
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'AccountCreated'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.accounts).toContainEqual(account);
    });

    it('should handle CategoryCreated event', () => {
      const category = new Category({
        id: 'cat1',
        name: 'Alimentação',
        type: 'expense',
        createdAt: new Date(),
      });

      const event = DomainEventFactory.createCategoryCreated(category);
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'CategoryCreated'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.categories).toContainEqual(category);
    });

    it('should handle GoalCreated event', () => {
      const goal = new Goal({
        id: 'goal1',
        userId: 'user1',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      const event = DomainEventFactory.createGoalCreated(goal);
      
      // Simulate event being published
      const eventHandler = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'GoalCreated'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(event);
      }

      const state = store.getState();
      expect(state.goals).toContainEqual(goal);
    });
  });

  describe('computed values', () => {
    it('should calculate financial summary correctly', () => {
      const operations = [
        new Operation({
          id: 'op1',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date('2024-01-01'),
          value: new Money(3000, 'BRL'),
          category: 'salary',
          createdAt: new Date(),
        }),
        new Operation({
          id: 'op2',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date('2024-01-02'),
          value: new Money(500, 'BRL'),
          category: 'housing',
          createdAt: new Date(),
        }),
        new Operation({
          id: 'op3',
          nature: 'receita',
          state: 'receber',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date('2024-01-03'),
          value: new Money(1000, 'BRL'),
          category: 'freelance',
          createdAt: new Date(),
        })
      ];

      store.setState({ operations });

      const summary = store.getFinancialSummary();
      
      expect(summary.totalReceitas).toBe(3000);
      expect(summary.totalDespesas).toBe(500);
      expect(summary.saldoLiquido).toBe(2500);
      expect(summary.receitasPendentes).toBe(1000);
      expect(summary.despesasPendentes).toBe(0);
      expect(summary.totalOperacoes).toBe(3);
      expect(summary.operacoesPendentes).toBe(1);
    });

    it('should filter operations by period', () => {
      const operations = [
        new Operation({
          id: 'op1',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date(2024, 0, 1), // Janeiro 2024
          value: new Money(3000, 'BRL'),
          category: 'salary',
          createdAt: new Date(),
        }),
        new Operation({
          id: 'op2',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'main',
          destinationAccount: 'main',
          date: new Date(2024, 1, 1), // Fevereiro 2024
          value: new Money(500, 'BRL'),
          category: 'housing',
          createdAt: new Date(),
        })
      ];

      store.setState({ 
        operations,
        selectedPeriod: '2024-01'
      });

      const filteredOperations = store.getFilteredOperations();
      expect(filteredOperations).toHaveLength(1);
      expect(filteredOperations[0].id).toBe('op1');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      const mockListener = jest.fn();
      store.subscribe(mockListener);

      store.setState({ 
        error: 'Database connection failed',
        loading: false 
      });

      const state = store.getState();
      expect(state.error).toBe('Database connection failed');
      expect(state.loading).toBe(false);
    });

    it('should clear errors', () => {
      store.setState({ error: 'Test error' });
      expect(store.getState().error).toBe('Test error');

      store.setState({ error: null });
      expect(store.getState().error).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from events on destroy', () => {
      store.destroy();
      
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('OperationCreated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('OperationUpdated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('OperationDeleted', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('AccountCreated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('AccountUpdated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('AccountDeleted', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('CategoryCreated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('CategoryUpdated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('CategoryDeleted', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('GoalCreated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('GoalUpdated', expect.any(Function));
      expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('GoalDeleted', expect.any(Function));
    });
  });
});
