// Tests for Goal Entity
import { Goal } from '../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Goal Entity', () => {
  describe('constructor', () => {
    it('should create goal with valid data', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        strategy: 'Poupar 30% da renda',
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active'
      });

      expect(goal.id).toBe('goal-1');
      expect(goal.userId).toBe('user-1');
      expect(goal.description).toBe('Comprar um carro');
      expect(goal.type).toBe('compra');
      expect(goal.targetValue).toEqual(new Money(50000, 'BRL'));
      expect(goal.startDate).toEqual(new Date('2024-01-01'));
      expect(goal.endDate).toEqual(new Date('2024-12-31'));
      expect(goal.monthlyIncome).toEqual(new Money(5000, 'BRL'));
      expect(goal.fixedExpenses).toEqual(new Money(2000, 'BRL'));
      expect(goal.availablePerMonth).toEqual(new Money(3000, 'BRL'));
      expect(goal.importance).toBe('alta');
      expect(goal.priority).toBe(1);
      expect(goal.strategy).toBe('Poupar 30% da renda');
      expect(goal.monthlyContribution).toEqual(new Money(1500, 'BRL'));
      expect(goal.numParcela).toBe(12);
      expect(goal.status).toBe('active');
    });

    it('should create goal with minimal required data', () => {
      const goal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      expect(goal.id).toBe('goal-2');
      expect(goal.description).toBe('Economizar para emergências');
      expect(goal.type).toBe('economia');
      expect(goal.strategy).toBeUndefined();
      expect(goal.status).toBe('active'); // default value
    });
  });

  describe('validation', () => {
    it('should throw error for empty description', () => {
      expect(() => {
        new Goal({
          id: 'goal-1',
          userId: 'user-1',
          description: '',
          type: 'economia',
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30'),
          monthlyIncome: new Money(3000, 'BRL'),
          fixedExpenses: new Money(1500, 'BRL'),
          availablePerMonth: new Money(1500, 'BRL'),
          importance: 'média',
          priority: 2,
          monthlyContribution: new Money(500, 'BRL'),
          numParcela: 6
        });
      }).toThrow('Goal description cannot be empty');
    });

    it('should throw error for invalid goal type', () => {
      expect(() => {
        new Goal({
          id: 'goal-1',
          userId: 'user-1',
          description: 'Test Goal',
          type: 'invalid' as any,
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30'),
          monthlyIncome: new Money(3000, 'BRL'),
          fixedExpenses: new Money(1500, 'BRL'),
          availablePerMonth: new Money(1500, 'BRL'),
          importance: 'média',
          priority: 2,
          monthlyContribution: new Money(500, 'BRL'),
          numParcela: 6
        });
      }).toThrow('Invalid goal type: invalid');
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        new Goal({
          id: 'goal-1',
          userId: 'user-1',
          description: 'Test Goal',
          type: 'economia',
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30'),
          monthlyIncome: new Money(3000, 'BRL'),
          fixedExpenses: new Money(1500, 'BRL'),
          availablePerMonth: new Money(1500, 'BRL'),
          importance: 'média',
          priority: 6, // invalid priority
          monthlyContribution: new Money(500, 'BRL'),
          numParcela: 6
        });
      }).toThrow('Priority must be between 1 and 5');
    });

    it('should throw error for end date before start date', () => {
      expect(() => {
        new Goal({
          id: 'goal-1',
          userId: 'user-1',
          description: 'Test Goal',
          type: 'economia',
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-06-30'),
          endDate: new Date('2024-01-01'), // end date before start date
          monthlyIncome: new Money(3000, 'BRL'),
          fixedExpenses: new Money(1500, 'BRL'),
          availablePerMonth: new Money(1500, 'BRL'),
          importance: 'média',
          priority: 2,
          monthlyContribution: new Money(500, 'BRL'),
          numParcela: 6
        });
      }).toThrow('End date must be after start date');
    });
  });

  describe('business methods', () => {
    it('should check if goal is for economy', () => {
      const economyGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Economizar',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      const purchaseGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Comprar carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      expect(economyGoal.isEconomy()).toBe(true);
      expect(purchaseGoal.isEconomy()).toBe(false);
    });

    it('should check if goal is for purchase', () => {
      const economyGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Economizar',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      const purchaseGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Comprar carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      expect(purchaseGoal.isPurchase()).toBe(true);
      expect(economyGoal.isPurchase()).toBe(false);
    });

    it('should check if goal is active', () => {
      const activeGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Test Goal',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6,
        status: 'active'
      });

      const completedGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Test Goal',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6,
        status: 'completed'
      });

      expect(activeGoal.isActive()).toBe(true);
      expect(completedGoal.isActive()).toBe(false);
    });

    it('should calculate total contribution needed', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Test Goal',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      const totalContribution = goal.getTotalContributionNeeded();
      expect(totalContribution).toEqual(new Money(3000, 'BRL')); // 500 * 6
    });
  });

  describe('goal types', () => {
    it('should validate all goal types', () => {
      const validTypes = ['economia', 'compra'];

      validTypes.forEach(type => {
        expect(() => {
          new Goal({
            id: `goal-${type}`,
            userId: 'user-1',
            description: `Goal ${type}`,
            type: type as any,
            targetValue: new Money(10000, 'BRL'),
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
            monthlyIncome: new Money(3000, 'BRL'),
            fixedExpenses: new Money(1500, 'BRL'),
            availablePerMonth: new Money(1500, 'BRL'),
            importance: 'média',
            priority: 2,
            monthlyContribution: new Money(500, 'BRL'),
            numParcela: 6
          });
        }).not.toThrow();
      });
    });
  });

  describe('equality', () => {
    it('should compare goals by id', () => {
      const goal1 = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Goal 1',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      const goal2 = new Goal({
        id: 'goal-1',
        userId: 'user-2',
        description: 'Goal 2',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const goal3 = new Goal({
        id: 'goal-3',
        userId: 'user-1',
        description: 'Goal 3',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      expect(goal1.equals(goal2)).toBe(true);
      expect(goal1.equals(goal3)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize goal to JSON', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        strategy: 'Poupar 30% da renda',
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active'
      });

      const json = goal.toJSON();

      expect(json).toEqual({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: 50000,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
        monthlyIncome: 5000,
        fixedExpenses: 2000,
        availablePerMonth: 3000,
        importance: 'alta',
        priority: 1,
        strategy: 'Poupar 30% da renda',
        monthlyContribution: 1500,
        numParcela: 12,
        status: 'active',
        createdAt: expect.any(String)
      });
    });
  });
}); 