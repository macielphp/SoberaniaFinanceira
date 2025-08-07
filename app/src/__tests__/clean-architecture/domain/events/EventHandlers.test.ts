import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory, DomainEventType, EventTypeGuards } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('Event Handlers', () => {
  let eventBus: EventBus;
  let operationHandler: jest.Mock;
  let accountHandler: jest.Mock;
  let categoryHandler: jest.Mock;
  let goalHandler: jest.Mock;
  let notificationHandler: jest.Mock;
  let auditHandler: jest.Mock;

  beforeEach(() => {
    eventBus = new EventBus();
    
    // Mock handlers
    operationHandler = jest.fn();
    accountHandler = jest.fn();
    categoryHandler = jest.fn();
    goalHandler = jest.fn();
    notificationHandler = jest.fn();
    auditHandler = jest.fn();
  });

  describe('Operation Event Handlers', () => {
    it('should handle OperationCreated event', () => {
      const operation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        receipt: undefined,
        project: 'default',
      });

      const event = DomainEventFactory.createOperationCreated(operation);

      // Subscribe handlers
      eventBus.subscribe('OperationCreated', operationHandler);
      eventBus.subscribe('OperationCreated', notificationHandler);
      eventBus.subscribe('OperationCreated', auditHandler);

      // Publish event
      eventBus.publish('OperationCreated', event);

      expect(operationHandler).toHaveBeenCalledWith(event);
      expect(notificationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle OperationUpdated event', () => {
      const operation = new Operation({
        id: '1',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(500),
        category: 'category2',
        details: 'Aluguel',
        receipt: undefined,
        project: 'default',
      });

      const event = DomainEventFactory.createOperationUpdated(operation);

      eventBus.subscribe('OperationUpdated', operationHandler);
      eventBus.subscribe('OperationUpdated', auditHandler);

      eventBus.publish('OperationUpdated', event);

      expect(operationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle OperationDeleted event', () => {
      const event = DomainEventFactory.createOperationDeleted('1');

      eventBus.subscribe('OperationDeleted', operationHandler);
      eventBus.subscribe('OperationDeleted', auditHandler);

      eventBus.publish('OperationDeleted', event);

      expect(operationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });
  });

  describe('Account Event Handlers', () => {
    it('should handle AccountCreated event', () => {
      const account = new Account({
        id: '1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(5000),
        isActive: true,
      });

      const event = DomainEventFactory.createAccountCreated(account);

      eventBus.subscribe('AccountCreated', accountHandler);
      eventBus.subscribe('AccountCreated', notificationHandler);
      eventBus.subscribe('AccountCreated', auditHandler);

      eventBus.publish('AccountCreated', event);

      expect(accountHandler).toHaveBeenCalledWith(event);
      expect(notificationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle AccountUpdated event', () => {
      const account = new Account({
        id: '1',
        name: 'Conta Atualizada',
        type: 'poupanca',
        balance: new Money(10000),
        isActive: true,
      });

      const event = DomainEventFactory.createAccountUpdated(account);

      eventBus.subscribe('AccountUpdated', accountHandler);
      eventBus.subscribe('AccountUpdated', auditHandler);

      eventBus.publish('AccountUpdated', event);

      expect(accountHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle AccountDeleted event', () => {
      const event = DomainEventFactory.createAccountDeleted('1');

      eventBus.subscribe('AccountDeleted', accountHandler);
      eventBus.subscribe('AccountDeleted', auditHandler);

      eventBus.publish('AccountDeleted', event);

      expect(accountHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });
  });

  describe('Category Event Handlers', () => {
    it('should handle CategoryCreated event', () => {
      const category = new Category({
        id: '1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false,
      });

      const event = DomainEventFactory.createCategoryCreated(category);

      eventBus.subscribe('CategoryCreated', categoryHandler);
      eventBus.subscribe('CategoryCreated', auditHandler);

      eventBus.publish('CategoryCreated', event);

      expect(categoryHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle CategoryUpdated event', () => {
      const category = new Category({
        id: '1',
        name: 'Alimentação Atualizada',
        type: 'expense',
        isDefault: true,
      });

      const event = DomainEventFactory.createCategoryUpdated(category);

      eventBus.subscribe('CategoryUpdated', categoryHandler);
      eventBus.subscribe('CategoryUpdated', auditHandler);

      eventBus.publish('CategoryUpdated', event);

      expect(categoryHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle CategoryDeleted event', () => {
      const event = DomainEventFactory.createCategoryDeleted('1');

      eventBus.subscribe('CategoryDeleted', categoryHandler);
      eventBus.subscribe('CategoryDeleted', auditHandler);

      eventBus.publish('CategoryDeleted', event);

      expect(categoryHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });
  });

  describe('Goal Event Handlers', () => {
    it('should handle GoalCreated event', () => {
      const goal = new Goal({
        id: '1',
        userId: 'user1',
        description: 'Viagem para Europa',
        type: 'economia',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(5000),
        importance: 'alta',
        priority: 1,
        strategy: 'monthly',
        monthlyContribution: new Money(2000),
        numParcela: 12,
      });

      const event = DomainEventFactory.createGoalCreated(goal);

      eventBus.subscribe('GoalCreated', goalHandler);
      eventBus.subscribe('GoalCreated', notificationHandler);
      eventBus.subscribe('GoalCreated', auditHandler);

      eventBus.publish('GoalCreated', event);

      expect(goalHandler).toHaveBeenCalledWith(event);
      expect(notificationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle GoalUpdated event', () => {
      const goal = new Goal({
        id: '1',
        userId: 'user1',
        description: 'Viagem Atualizada',
        type: 'economia',
        targetValue: new Money(60000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(5000),
        importance: 'alta',
        priority: 1,
        strategy: 'weekly',
        monthlyContribution: new Money(2500),
        numParcela: 12,
      });

      const event = DomainEventFactory.createGoalUpdated(goal);

      eventBus.subscribe('GoalUpdated', goalHandler);
      eventBus.subscribe('GoalUpdated', auditHandler);

      eventBus.publish('GoalUpdated', event);

      expect(goalHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });

    it('should handle GoalCompleted event', () => {
      const goal = new Goal({
        id: '1',
        userId: 'user1',
        description: 'Viagem Concluída',
        type: 'economia',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(5000),
        importance: 'alta',
        priority: 1,
        strategy: 'monthly',
        monthlyContribution: new Money(2000),
        numParcela: 12,
        status: 'completed',
      });

      const event = DomainEventFactory.createGoalCompleted(goal);

      eventBus.subscribe('GoalCompleted', goalHandler);
      eventBus.subscribe('GoalCompleted', notificationHandler);
      eventBus.subscribe('GoalCompleted', auditHandler);

      eventBus.publish('GoalCompleted', event);

      expect(goalHandler).toHaveBeenCalledWith(event);
      expect(notificationHandler).toHaveBeenCalledWith(event);
      expect(auditHandler).toHaveBeenCalledWith(event);
    });
  });

  describe('Event Type Guards', () => {
    it('should correctly identify operation events', () => {
      const operation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Teste',
        receipt: undefined,
        project: 'default',
      });

      const createdEvent = DomainEventFactory.createOperationCreated(operation);
      const updatedEvent = DomainEventFactory.createOperationUpdated(operation);
      const deletedEvent = DomainEventFactory.createOperationDeleted('1');

      expect(EventTypeGuards.isOperationEvent(createdEvent)).toBe(true);
      expect(EventTypeGuards.isOperationEvent(updatedEvent)).toBe(true);
      expect(EventTypeGuards.isOperationEvent(deletedEvent)).toBe(true);
    });

    it('should correctly identify account events', () => {
      const account = new Account({
        id: '1',
        name: 'Conta Teste',
        type: 'corrente',
        balance: new Money(1000),
      });

      const createdEvent = DomainEventFactory.createAccountCreated(account);
      const updatedEvent = DomainEventFactory.createAccountUpdated(account);
      const deletedEvent = DomainEventFactory.createAccountDeleted('1');

      expect(EventTypeGuards.isAccountEvent(createdEvent)).toBe(true);
      expect(EventTypeGuards.isAccountEvent(updatedEvent)).toBe(true);
      expect(EventTypeGuards.isAccountEvent(deletedEvent)).toBe(true);
    });

    it('should correctly identify category events', () => {
      const category = new Category({
        id: '1',
        name: 'Categoria Teste',
        type: 'expense',
      });

      const createdEvent = DomainEventFactory.createCategoryCreated(category);
      const updatedEvent = DomainEventFactory.createCategoryUpdated(category);
      const deletedEvent = DomainEventFactory.createCategoryDeleted('1');

      expect(EventTypeGuards.isCategoryEvent(createdEvent)).toBe(true);
      expect(EventTypeGuards.isCategoryEvent(updatedEvent)).toBe(true);
      expect(EventTypeGuards.isCategoryEvent(deletedEvent)).toBe(true);
    });

    it('should correctly identify goal events', () => {
      const goal = new Goal({
        id: '1',
        userId: 'user1',
        description: 'Meta Teste',
        type: 'economia',
        targetValue: new Money(10000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'média',
        priority: 1,
        strategy: 'monthly',
        monthlyContribution: new Money(1000),
        numParcela: 12,
      });

      const createdEvent = DomainEventFactory.createGoalCreated(goal);
      const updatedEvent = DomainEventFactory.createGoalUpdated(goal);
      const deletedEvent = DomainEventFactory.createGoalDeleted('1');
      const completedEvent = DomainEventFactory.createGoalCompleted(goal);

      expect(EventTypeGuards.isGoalEvent(createdEvent)).toBe(true);
      expect(EventTypeGuards.isGoalEvent(updatedEvent)).toBe(true);
      expect(EventTypeGuards.isGoalEvent(deletedEvent)).toBe(true);
      expect(EventTypeGuards.isGoalEvent(completedEvent)).toBe(true);
    });

    it('should correctly identify event types', () => {
      const operation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Teste',
        receipt: undefined,
        project: 'default',
      });

      const createdEvent = DomainEventFactory.createOperationCreated(operation);
      const updatedEvent = DomainEventFactory.createOperationUpdated(operation);
      const deletedEvent = DomainEventFactory.createOperationDeleted('1');

      expect(EventTypeGuards.isCreatedEvent(createdEvent)).toBe(true);
      expect(EventTypeGuards.isUpdatedEvent(updatedEvent)).toBe(true);
      expect(EventTypeGuards.isDeletedEvent(deletedEvent)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      const operation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Teste',
        receipt: undefined,
        project: 'default',
      });

      const event = DomainEventFactory.createOperationCreated(operation);

      eventBus.subscribe('OperationCreated', errorHandler);
      eventBus.subscribe('OperationCreated', operationHandler);

      // Should not throw error
      expect(() => {
        eventBus.publish('OperationCreated', event);
      }).not.toThrow();

      expect(operationHandler).toHaveBeenCalledWith(event);
    });
  });
}); 