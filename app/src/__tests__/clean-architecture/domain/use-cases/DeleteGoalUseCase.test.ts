// Tests for DeleteGoalUseCase
import { DeleteGoalUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockGoalRepository implements IGoalRepository {
  private goals: Goal[] = [];

  async save(goal: Goal): Promise<Goal> {
    const existingIndex = this.goals.findIndex(g => g.id === goal.id);
    if (existingIndex >= 0) {
      this.goals[existingIndex] = goal;
    } else {
      this.goals.push(goal);
    }
    return goal;
  }

  async findById(id: string): Promise<Goal | null> {
    return this.goals.find(goal => goal.id === id) || null;
  }

  async findAll(): Promise<Goal[]> {
    return [...this.goals];
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return this.goals.filter(goal => goal.userId === userId);
  }

  async findByType(type: string): Promise<Goal[]> {
    return this.goals.filter(goal => goal.type === type);
  }

  async findByStatus(status: string): Promise<Goal[]> {
    return this.goals.filter(goal => goal.status === status);
  }

  async findActive(): Promise<Goal[]> {
    return this.goals.filter(goal => goal.status === 'active');
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    return this.goals.filter(goal => 
      goal.startDate >= startDate && goal.endDate <= endDate
    );
  }

  async delete(id: string): Promise<boolean> {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index >= 0) {
      this.goals.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.goals.length;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.goals.filter(goal => goal.userId === userId).length;
  }

  async countActive(): Promise<number> {
    return this.goals.filter(goal => goal.status === 'active').length;
  }
}

describe('DeleteGoalUseCase', () => {
  let useCase: DeleteGoalUseCase;
  let mockRepository: MockGoalRepository;

  beforeEach(() => {
    mockRepository = new MockGoalRepository();
    useCase = new DeleteGoalUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete goal successfully', async () => {
      // Create test goal
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
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

      await mockRepository.save(goal);

      const result = await useCase.execute('goal-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);
    });

    it('should handle non-existent goal gracefully', async () => {
      const result = await useCase.execute('non-existent-goal');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(false);
    });

    it('should not affect other goals when deleting one', async () => {
      // Create multiple goals
      const goal1 = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
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

      const goal2 = new Goal({
        id: 'goal-2',
        description: 'Viagem para Europa',
        type: 'compra' as any,
        targetValue: new Money(15000, 'BRL'),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'média' as any,
        priority: 2,
        monthlyContribution: new Money(1000, 'BRL'),
        numParcela: 6,
        status: 'active' as any,
        userId: 'user1'
      });

      await mockRepository.save(goal1);
      await mockRepository.save(goal2);

      // Delete goal1
      const result = await useCase.execute('goal-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);

      // Verify goal2 still exists
      const remainingGoals = await mockRepository.findAll();
      expect(remainingGoals).toHaveLength(1);
      expect(remainingGoals[0].id).toBe('goal-2');
    });

    it('should handle deleting active goals', async () => {
      const activeGoal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
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

      await mockRepository.save(activeGoal);

      const result = await useCase.execute('goal-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);
    });

    it('should handle deleting completed goals', async () => {
      const completedGoal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'completed' as any,
        userId: 'user1'
      });

      await mockRepository.save(completedGoal);

      const result = await useCase.execute('goal-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);
    });
  });

  describe('validation', () => {
    it('should fail when goal ID is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });

    it('should fail when goal ID is null', async () => {
      const result = await useCase.execute(null as any);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });

    it('should fail when goal ID is undefined', async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });
  });

  describe('repository errors', () => {
    it('should handle repository delete errors', async () => {
      // Create a mock repository that throws an error on delete
      const errorRepository: IGoalRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(new Goal({
          id: 'goal-1',
          description: 'Test goal',
          type: 'economia' as any,
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          monthlyIncome: new Money(5000, 'BRL'),
          fixedExpenses: new Money(2000, 'BRL'),
          availablePerMonth: new Money(1000, 'BRL'),
          importance: 'baixa' as any,
          priority: 1,
          monthlyContribution: new Money(500, 'BRL'),
          numParcela: 12,
          status: 'active' as any,
          userId: 'user1'
        })),
        findAll: jest.fn(),
        findByUserId: jest.fn(),
        findByType: jest.fn(),
        findByStatus: jest.fn(),
        findActive: jest.fn(),
        findByDateRange: jest.fn(),
        delete: jest.fn().mockRejectedValue(new Error('Database error')),
        count: jest.fn(),
        countByUserId: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new DeleteGoalUseCase(errorRepository);

      const result = await useCaseWithError.execute('goal-1');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete goal');
    });

    it('should handle repository findById errors', async () => {
      // Create a mock repository that throws an error on findById
      const errorRepository: IGoalRepository = {
        save: jest.fn(),
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
        findAll: jest.fn(),
        findByUserId: jest.fn(),
        findByType: jest.fn(),
        findByStatus: jest.fn(),
        findActive: jest.fn(),
        findByDateRange: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByUserId: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new DeleteGoalUseCase(errorRepository);

      const result = await useCaseWithError.execute('goal-1');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete goal');
    });
  });

  describe('edge cases', () => {
    it('should handle deleting the last goal', async () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
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

      await mockRepository.save(goal);

      const result = await useCase.execute('goal-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);

      // Verify no goals remain
      const remainingGoals = await mockRepository.findAll();
      expect(remainingGoals).toHaveLength(0);
    });

    it('should handle multiple deletion attempts on same goal', async () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(500000, 'BRL'),
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

      await mockRepository.save(goal);

      // First deletion
      const result1 = await useCase.execute('goal-1');
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().deleted).toBe(true);

      // Second deletion attempt
      const result2 = await useCase.execute('goal-1');
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().deleted).toBe(false);
    });
  });
}); 