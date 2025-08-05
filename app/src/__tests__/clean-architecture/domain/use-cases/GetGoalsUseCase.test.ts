// Tests for GetGoalsUseCase
import { GetGoalsUseCase } from '../../../../clean-architecture/domain/use-cases/GetGoalsUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockGoalRepository implements IGoalRepository {
  private goals: Goal[] = [];

  async save(goal: Goal): Promise<Goal> {
    this.goals.push(goal);
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

describe('GetGoalsUseCase', () => {
  let useCase: GetGoalsUseCase;
  let mockRepository: MockGoalRepository;

  beforeEach(() => {
    mockRepository = new MockGoalRepository();
    useCase = new GetGoalsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return empty list when no goals exist', async () => {
      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.goals).toEqual([]);
      expect(response.total).toBe(0);
    });

    it('should return all existing goals', async () => {
      // Create test goals
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

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.goals).toHaveLength(2);
      expect(response.total).toBe(2);
      expect(response.goals).toContainEqual(goal1);
      expect(response.goals).toContainEqual(goal2);
    });

    it('should return correct total count', async () => {
      // Create multiple goals
      const goals = [
        new Goal({
          id: 'goal-1',
          description: 'Goal 1',
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
        }),
        new Goal({
          id: 'goal-2',
          description: 'Goal 2',
          type: 'compra' as any,
          targetValue: new Money(5000, 'BRL'),
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-12-31'),
          monthlyIncome: new Money(5000, 'BRL'),
          fixedExpenses: new Money(2000, 'BRL'),
          availablePerMonth: new Money(1000, 'BRL'),
          importance: 'média' as any,
          priority: 2,
          monthlyContribution: new Money(800, 'BRL'),
          numParcela: 6,
          status: 'completed' as any,
          userId: 'user1'
        }),
        new Goal({
          id: 'goal-3',
          description: 'Goal 3',
          type: 'economia' as any,
          targetValue: new Money(20000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2026-12-31'),
          monthlyIncome: new Money(5000, 'BRL'),
          fixedExpenses: new Money(2000, 'BRL'),
          availablePerMonth: new Money(1000, 'BRL'),
          importance: 'alta' as any,
          priority: 3,
          monthlyContribution: new Money(600, 'BRL'),
          numParcela: 36,
          status: 'active' as any,
          userId: 'user1'
        })
      ];

      for (const goal of goals) {
        await mockRepository.save(goal);
      }

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.goals).toHaveLength(3);
      expect(response.total).toBe(3);
    });
  });

  describe('repository errors', () => {
    it('should handle repository findAll errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IGoalRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
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

      const useCaseWithError = new GetGoalsUseCase(errorRepository);

      const result = await useCaseWithError.execute();

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get goals');
    });

    it('should handle repository count errors', async () => {
      // Create a mock repository that throws an error on count
      const errorRepository: IGoalRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockResolvedValue([]),
        findByUserId: jest.fn(),
        findByType: jest.fn(),
        findByStatus: jest.fn(),
        findActive: jest.fn(),
        findByDateRange: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockRejectedValue(new Error('Count error')),
        countByUserId: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new GetGoalsUseCase(errorRepository);

      const result = await useCaseWithError.execute();

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get goals');
    });
  });
}); 