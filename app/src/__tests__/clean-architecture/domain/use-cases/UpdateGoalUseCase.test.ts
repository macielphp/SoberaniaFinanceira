// Tests for UpdateGoalUseCase
import { UpdateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateGoalUseCase';
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

describe('UpdateGoalUseCase', () => {
  let useCase: UpdateGoalUseCase;
  let mockRepository: MockGoalRepository;

  beforeEach(() => {
    mockRepository = new MockGoalRepository();
    useCase = new UpdateGoalUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update goal description successfully', async () => {
      // Create initial goal
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        description: 'Comprar casa própria'
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isSuccess()).toBe(true);
      const updatedGoal = result.getOrThrow().goal;
      expect(updatedGoal.description).toBe('Comprar casa própria');
      expect(updatedGoal.id).toBe('goal-1');
      expect(updatedGoal.type).toBe('economia');
      expect(updatedGoal.targetValue).toEqual(new Money(500000, 'BRL'));
    });

    it('should update goal type successfully', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        type: 'compra' as any
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isSuccess()).toBe(true);
      const updatedGoal = result.getOrThrow().goal;
      expect(updatedGoal.type).toBe('compra');
      expect(updatedGoal.description).toBe('Comprar casa');
    });

    it('should update multiple fields successfully', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        description: 'Comprar casa própria',
        targetValue: 600000,
        priority: 2,
        importance: 'média' as any
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isSuccess()).toBe(true);
      const updatedGoal = result.getOrThrow().goal;
      expect(updatedGoal.description).toBe('Comprar casa própria');
      expect(updatedGoal.targetValue).toEqual(new Money(600000, 'BRL'));
      expect(updatedGoal.priority).toBe(2);
      expect(updatedGoal.importance).toBe('média');
    });

    it('should save updated goal to repository', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        description: 'Comprar casa própria'
      };

      const result = await useCase.execute(updateRequest);
      const updatedGoal = result.getOrThrow().goal;

      // Verify goal was saved to repository
      const savedGoal = await mockRepository.findById(updatedGoal.id);
      expect(savedGoal).toEqual(updatedGoal);
      expect(savedGoal?.description).toBe('Comprar casa própria');
    });
  });

  describe('validation', () => {
    it('should fail when goal ID is empty', async () => {
      const updateRequest = {
        id: '',
        description: 'Updated description'
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });

    it('should fail when goal ID is null', async () => {
      const updateRequest = {
        id: null as any,
        description: 'Updated description'
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });

    it('should fail when goal ID is undefined', async () => {
      const updateRequest = {
        id: undefined as any,
        description: 'Updated description'
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal ID cannot be empty');
    });

    it('should fail when goal does not exist', async () => {
      const updateRequest = {
        id: 'non-existent-goal',
        description: 'Updated description'
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal not found');
    });

    it('should fail when description is empty', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        description: ''
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal description cannot be empty');
    });

    it('should fail when type is invalid', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        type: 'invalid-type' as any
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid goal type');
    });

    it('should fail when priority is invalid', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        priority: 0
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Priority must be between 1 and 5');
    });

    it('should fail when target value is negative', async () => {
      const initialGoal = new Goal({
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

      await mockRepository.save(initialGoal);

      const updateRequest = {
        id: 'goal-1',
        targetValue: -1000
      };

      const result = await useCase.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Target value must be greater than zero');
    });
  });

  describe('repository errors', () => {
    it('should handle repository save errors', async () => {
      // Create a mock repository that throws an error on save
      const errorRepository: IGoalRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
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
        delete: jest.fn(),
        count: jest.fn(),
        countByUserId: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new UpdateGoalUseCase(errorRepository);

      const updateRequest = {
        id: 'goal-1',
        description: 'Updated description'
      };

      const result = await useCaseWithError.execute(updateRequest);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update goal');
    });
  });
}); 