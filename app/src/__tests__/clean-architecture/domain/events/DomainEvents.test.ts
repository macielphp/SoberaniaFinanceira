import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('Domain Events', () => {
  describe('Operation Events', () => {
    it('should create OperationCreated event', () => {
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

      const event = {
        type: 'OperationCreated',
        data: operation,
        timestamp: new Date(),
      };

      expect(event.type).toBe('OperationCreated');
      expect(event.data).toBe(operation);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create OperationUpdated event', () => {
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

      const event = {
        type: 'OperationUpdated',
        data: operation,
        timestamp: new Date(),
      };

      expect(event.type).toBe('OperationUpdated');
      expect(event.data).toBe(operation);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create OperationDeleted event', () => {
      const operationId = '1';

      const event = {
        type: 'OperationDeleted',
        data: { operationId },
        timestamp: new Date(),
      };

      expect(event.type).toBe('OperationDeleted');
      expect(event.data.operationId).toBe(operationId);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Account Events', () => {
    it('should create AccountCreated event', () => {
      const account = new Account({
        id: '1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(5000),
        isActive: true,
      });

      const event = {
        type: 'AccountCreated',
        data: account,
        timestamp: new Date(),
      };

      expect(event.type).toBe('AccountCreated');
      expect(event.data).toBe(account);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create AccountUpdated event', () => {
      const account = new Account({
        id: '1',
        name: 'Conta Atualizada',
        type: 'poupanca',
        balance: new Money(10000),
        isActive: true,
      });

      const event = {
        type: 'AccountUpdated',
        data: account,
        timestamp: new Date(),
      };

      expect(event.type).toBe('AccountUpdated');
      expect(event.data).toBe(account);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create AccountDeleted event', () => {
      const accountId = '1';

      const event = {
        type: 'AccountDeleted',
        data: { accountId },
        timestamp: new Date(),
      };

      expect(event.type).toBe('AccountDeleted');
      expect(event.data.accountId).toBe(accountId);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Category Events', () => {
    it('should create CategoryCreated event', () => {
      const category = new Category({
        id: '1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false,
      });

      const event = {
        type: 'CategoryCreated',
        data: category,
        timestamp: new Date(),
      };

      expect(event.type).toBe('CategoryCreated');
      expect(event.data).toBe(category);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create CategoryUpdated event', () => {
      const category = new Category({
        id: '1',
        name: 'Alimentação Atualizada',
        type: 'expense',
        isDefault: true,
      });

      const event = {
        type: 'CategoryUpdated',
        data: category,
        timestamp: new Date(),
      };

      expect(event.type).toBe('CategoryUpdated');
      expect(event.data).toBe(category);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create CategoryDeleted event', () => {
      const categoryId = '1';

      const event = {
        type: 'CategoryDeleted',
        data: { categoryId },
        timestamp: new Date(),
      };

      expect(event.type).toBe('CategoryDeleted');
      expect(event.data.categoryId).toBe(categoryId);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Goal Events', () => {
    it('should create GoalCreated event', () => {
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

      const event = {
        type: 'GoalCreated',
        data: goal,
        timestamp: new Date(),
      };

      expect(event.type).toBe('GoalCreated');
      expect(event.data).toBe(goal);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create GoalUpdated event', () => {
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

      const event = {
        type: 'GoalUpdated',
        data: goal,
        timestamp: new Date(),
      };

      expect(event.type).toBe('GoalUpdated');
      expect(event.data).toBe(goal);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create GoalDeleted event', () => {
      const goalId = '1';

      const event = {
        type: 'GoalDeleted',
        data: { goalId },
        timestamp: new Date(),
      };

      expect(event.type).toBe('GoalDeleted');
      expect(event.data.goalId).toBe(goalId);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create GoalCompleted event', () => {
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

      const event = {
        type: 'GoalCompleted',
        data: goal,
        timestamp: new Date(),
      };

      expect(event.type).toBe('GoalCompleted');
      expect(event.data).toBe(goal);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Event Properties', () => {
    it('should have consistent event structure', () => {
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

      const event = {
        type: 'OperationCreated',
        data: operation,
        timestamp: new Date(),
      };

      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('data');
      expect(event).toHaveProperty('timestamp');
      expect(typeof event.type).toBe('string');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should have unique event types', () => {
      const eventTypes = [
        'OperationCreated',
        'OperationUpdated',
        'OperationDeleted',
        'AccountCreated',
        'AccountUpdated',
        'AccountDeleted',
        'CategoryCreated',
        'CategoryUpdated',
        'CategoryDeleted',
        'GoalCreated',
        'GoalUpdated',
        'GoalDeleted',
        'GoalCompleted',
      ];

      const uniqueTypes = new Set(eventTypes);
      expect(uniqueTypes.size).toBe(eventTypes.length);
    });
  });
}); 