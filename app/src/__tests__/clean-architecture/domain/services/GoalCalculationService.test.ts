// Tests for GoalCalculationService
import { GoalCalculationService } from '../../../../clean-architecture/domain/services/GoalCalculationService';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GoalCalculationService', () => {
  let service: GoalCalculationService;

  beforeEach(() => {
    service = new GoalCalculationService();
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(25000, 'BRL');
      const progress = service.calculateProgress(goal, currentValue);

      expect(progress).toBe(25); // 25% (25000 / 100000 * 100)
    });

    it('should return 0 when current value is 0', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(0, 'BRL');
      const progress = service.calculateProgress(goal, currentValue);

      expect(progress).toBe(0);
    });

    it('should return 100 when current value equals target value', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(100000, 'BRL');
      const progress = service.calculateProgress(goal, currentValue);

      expect(progress).toBe(100);
    });

    it('should cap progress at 100 when current value exceeds target', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(120000, 'BRL');
      const progress = service.calculateProgress(goal, currentValue);

      expect(progress).toBe(100);
    });
  });

  describe('calculateRemainingAmount', () => {
    it('should calculate remaining amount correctly', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(25000, 'BRL');
      const remaining = service.calculateRemainingAmount(goal, currentValue);

      expect(remaining.value).toBe(75000);
      expect(remaining.currency).toBe('BRL');
    });

    it('should return 0 when current value equals target', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(100000, 'BRL');
      const remaining = service.calculateRemainingAmount(goal, currentValue);

      expect(remaining.value).toBe(0);
    });

    it('should return 0 when current value exceeds target', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(120000, 'BRL');
      const remaining = service.calculateRemainingAmount(goal, currentValue);

      expect(remaining.value).toBe(0);
    });
  });

  describe('calculateEstimatedCompletionTime', () => {
    it('should calculate estimated completion time in months', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(25000, 'BRL');
      const estimatedMonths = service.calculateEstimatedCompletionTime(goal, currentValue);

      // Remaining: 75000, Monthly contribution: 1500
      // 75000 / 1500 = 50 months
      expect(estimatedMonths).toBe(50);
    });

    it('should return 0 when goal is already completed', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(100000, 'BRL');
      const estimatedMonths = service.calculateEstimatedCompletionTime(goal, currentValue);

      expect(estimatedMonths).toBe(0);
    });

    it('should handle zero monthly contribution', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(0, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(25000, 'BRL');
      const estimatedMonths = service.calculateEstimatedCompletionTime(goal, currentValue);

      expect(estimatedMonths).toBe(Infinity);
    });
  });

  describe('calculateOptimalMonthlyContribution', () => {
    it('should calculate optimal monthly contribution to meet deadline', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(25000, 'BRL');
      const optimalContribution = service.calculateOptimalMonthlyContribution(goal, currentValue);

      // Remaining: 75000, Months until deadline: 19 (junho 2024 até dezembro 2025)
      // 75000 / 19 = 3947
      expect(optimalContribution.value).toBe(3947);
      expect(optimalContribution.currency).toBe('BRL');
    });

    it('should return 0 when goal is already completed', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const currentValue = new Money(100000, 'BRL');
      const optimalContribution = service.calculateOptimalMonthlyContribution(goal, currentValue);

      expect(optimalContribution.value).toBe(0);
    });
  });

  describe('calculateTotalContributionNeeded', () => {
    it('should calculate total contribution needed', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const totalNeeded = service.calculateTotalContributionNeeded(goal);

      // Monthly contribution * numParcela
      // 1500 * 24 = 36000
      expect(totalNeeded.value).toBe(36000);
      expect(totalNeeded.currency).toBe('BRL');
    });
  });

  describe('isGoalAchievable', () => {
    it('should return true when goal is achievable', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const isAchievable = service.isGoalAchievable(goal);

      expect(isAchievable).toBe(true);
    });

    it('should return false when monthly contribution exceeds available per month', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(1000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const isAchievable = service.isGoalAchievable(goal);

      expect(isAchievable).toBe(false);
    });
  });
}); 