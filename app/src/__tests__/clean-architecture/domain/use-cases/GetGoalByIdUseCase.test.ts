// Tests for GetGoalByIdUseCase
import { GetGoalByIdUseCase } from '../../../../clean-architecture/domain/use-cases/GetGoalByIdUseCase';
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

describe('GetGoalByIdUseCase', () => {
  let useCase: GetGoalByIdUseCase;
  let mockRepository: MockGoalRepository;

  beforeEach(() => {
    mockRepository = new MockGoalRepository();
    useCase = new GetGoalByIdUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return goal when it exists', async () => {
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
      const response = result.getOrThrow();
      expect(response.goal).toEqual(goal);
      expect(response.goal!.id).toBe('goal-1');
      expect(response.goal!.description).toBe('Comprar casa');
      expect(response.goal!.type).toBe('economia');
      expect(response.goal!.targetValue).toEqual(new Money(500000, 'BRL'));
    });

    it('should return null when goal does not exist', async () => {
      const result = await useCase.execute('non-existent-goal');

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.goal).toBeNull();
    });

    it('should return correct goal when multiple goals exist', async () => {
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

      // Get goal1
      const result1 = await useCase.execute('goal-1');
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().goal).toEqual(goal1);

      // Get goal2
      const result2 = await useCase.execute('goal-2');
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().goal).toEqual(goal2);
    });

    it('should handle different goal statuses', async () => {
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

      const completedGoal = new Goal({
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
        status: 'completed' as any,
        userId: 'user1'
      });

      await mockRepository.save(activeGoal);
      await mockRepository.save(completedGoal);

      // Get active goal
      const result1 = await useCase.execute('goal-1');
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().goal?.status).toBe('active');

      // Get completed goal
      const result2 = await useCase.execute('goal-2');
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().goal?.status).toBe('completed');
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

      const useCaseWithError = new GetGoalByIdUseCase(errorRepository);

      const result = await useCaseWithError.execute('goal-1');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get goal');
    });
  });

  describe('edge cases', () => {
    it('should handle case-sensitive ID matching', async () => {
      const goal = new Goal({
        id: 'Goal-1',
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

      // Should find with exact case
      const result1 = await useCase.execute('Goal-1');
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().goal).toEqual(goal);

      // Should not find with different case
      const result2 = await useCase.execute('goal-1');
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().goal).toBeNull();
    });

    it('should handle very long goal IDs', async () => {
      const longId = 'goal-' + 'a'.repeat(1000);
      const goal = new Goal({
        id: longId,
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

      const result = await useCase.execute(longId);
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().goal).toEqual(goal);
    });
  });
}); 