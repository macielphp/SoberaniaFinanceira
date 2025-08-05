// Tests for CreateGoalUseCase
import { CreateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/CreateGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal, GoalType, GoalImportance } from '../../../../clean-architecture/domain/entities/Goal';

// Mock repository for testing
class MockGoalRepository implements IGoalRepository {
  private goals: Goal[] = [];

  async save(goal: Goal): Promise<Goal> {
    this.goals.push(goal);
    return goal;
  }

  async findById(id: string): Promise<Goal | null> {
    return this.goals.find(g => g.id === id) || null;
  }

  async findAll(): Promise<Goal[]> {
    return [...this.goals];
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return [];
  }

  async findByType(type: string): Promise<Goal[]> {
    return [];
  }

  async findByStatus(status: string): Promise<Goal[]> {
    return [];
  }

  async findActive(): Promise<Goal[]> {
    return [];
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    return [];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.goals.findIndex(g => g.id === id);
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
    return 0;
  }

  async countActive(): Promise<number> {
    return 0;
  }
}

describe('CreateGoalUseCase', () => {
  let useCase: CreateGoalUseCase;
  let mockRepository: MockGoalRepository;

  beforeEach(() => {
    mockRepository = new MockGoalRepository();
    useCase = new CreateGoalUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a new goal successfully', async () => {
      const goalData = {
        description: 'Meta para comprar um carro novo',
        type: 'compra' as GoalType,
        targetValue: 20000,
        userId: 'user-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: 5000,
        fixedExpenses: 2000,
        availablePerMonth: 1000,
        importance: 'alta' as GoalImportance,
        priority: 3,
        monthlyContribution: 1000,
        numParcela: 20
      };

      const result = await useCase.execute(goalData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().goal).toBeInstanceOf(Goal);
      const goal = result.getOrThrow().goal;
      expect(goal.description).toBe('Meta para comprar um carro novo');
      expect(goal.type).toBe('compra');
      expect(goal.targetValue.value).toBe(20000);
      expect(goal.userId).toBe('user-1');
      expect(goal.startDate).toEqual(new Date('2024-01-01'));
      expect(goal.endDate).toEqual(new Date('2025-12-31'));
      expect(goal.monthlyIncome.value).toBe(5000);
      expect(goal.fixedExpenses.value).toBe(2000);
      expect(goal.availablePerMonth.value).toBe(1000);
      expect(goal.importance).toBe('alta');
      expect(goal.priority).toBe(3);
      expect(goal.monthlyContribution.value).toBe(1000);
      expect(goal.numParcela).toBe(20);
      expect(goal.id).toBeDefined();
      expect(goal.createdAt).toBeInstanceOf(Date);
    });

    it('should create goal with minimal required data', async () => {
      const goalData = {
        description: 'Viagem',
        type: 'economia' as GoalType,
        targetValue: 5000,
        userId: 'user-2',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 3000,
        fixedExpenses: 1000,
        availablePerMonth: 500,
        importance: 'média' as GoalImportance,
        priority: 2,
        monthlyContribution: 500,
        numParcela: 10
      };

      const result = await useCase.execute(goalData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().goal).toBeInstanceOf(Goal);
      const goal = result.getOrThrow().goal;
      expect(goal.description).toBe('Viagem');
      expect(goal.type).toBe('economia');
      expect(goal.targetValue.value).toBe(5000);
      expect(goal.userId).toBe('user-2');
      expect(goal.startDate).toEqual(new Date('2024-01-01'));
      expect(goal.endDate).toEqual(new Date('2024-12-31'));
      expect(goal.monthlyIncome.value).toBe(3000);
      expect(goal.fixedExpenses.value).toBe(1000);
      expect(goal.availablePerMonth.value).toBe(500);
      expect(goal.importance).toBe('média');
      expect(goal.priority).toBe(2);
      expect(goal.monthlyContribution.value).toBe(500);
      expect(goal.numParcela).toBe(10);
    });

    it('should save goal to repository', async () => {
      const goalData = {
        description: 'Comprar casa',
        type: 'compra' as GoalType,
        targetValue: 100000,
        userId: 'user-3',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        monthlyIncome: 8000,
        fixedExpenses: 3000,
        availablePerMonth: 2000,
        importance: 'alta' as GoalImportance,
        priority: 4,
        monthlyContribution: 2000,
        numParcela: 50
      };

      const result = await useCase.execute(goalData);
      const goal = result.getOrThrow().goal;

      // Verify goal was saved to repository
      const savedGoal = await mockRepository.findById(goal.id);
      expect(savedGoal).toEqual(goal);
    });

    it('should generate unique ID for each goal', async () => {
      const goalData1 = {
        description: 'Meta 1',
        type: 'economia' as GoalType,
        targetValue: 1000,
        userId: 'user-4',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 2000,
        fixedExpenses: 500,
        availablePerMonth: 300,
        importance: 'baixa' as GoalImportance,
        priority: 1,
        monthlyContribution: 100,
        numParcela: 10
      };
      const goalData2 = {
        description: 'Meta 2',
        type: 'compra' as GoalType,
        targetValue: 2000,
        userId: 'user-5',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: 4000,
        fixedExpenses: 1500,
        availablePerMonth: 1000,
        importance: 'alta' as GoalImportance,
        priority: 5,
        monthlyContribution: 500,
        numParcela: 20
      };

      const result1 = await useCase.execute(goalData1);
      const result2 = await useCase.execute(goalData2);

      const goal1 = result1.getOrThrow().goal;
      const goal2 = result2.getOrThrow().goal;

      expect(goal1.id).not.toBe(goal2.id);
    });
  });

  describe('validation', () => {
    it('should fail when description is empty', async () => {
      const goalData = {
        description: '',
        type: 'compra' as GoalType,
        targetValue: 1000,
        userId: 'user-6',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 2000,
        fixedExpenses: 500,
        availablePerMonth: 300,
        importance: 'baixa' as GoalImportance,
        priority: 1,
        monthlyContribution: 100,
        numParcela: 10
      };

      const result = await useCase.execute(goalData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Goal description cannot be empty');
    });

    it('should fail when targetValue is not positive', async () => {
      const goalData = {
        description: 'Meta',
        type: 'compra' as GoalType,
        targetValue: 0,
        userId: 'user-7',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 2000,
        fixedExpenses: 500,
        availablePerMonth: 300,
        importance: 'baixa' as GoalImportance,
        priority: 1,
        monthlyContribution: 100,
        numParcela: 10
      };

      const result = await useCase.execute(goalData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Target value must be greater than zero');
    });
  });

  describe('repository errors', () => {
    it('should handle repository save errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IGoalRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByUserId: jest.fn().mockResolvedValue([]),
        findByType: jest.fn().mockResolvedValue([]),
        findByStatus: jest.fn().mockResolvedValue([]),
        findActive: jest.fn().mockResolvedValue([]),
        findByDateRange: jest.fn().mockResolvedValue([]),
        delete: jest.fn(),
        count: jest.fn(),
        countByUserId: jest.fn().mockResolvedValue(0),
        countActive: jest.fn().mockResolvedValue(0)
      };

      const goalData = {
        description: 'Meta',
        type: 'compra' as GoalType,
        targetValue: 1000,
        userId: 'user-8',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 2000,
        fixedExpenses: 500,
        availablePerMonth: 300,
        importance: 'baixa' as GoalImportance,
        priority: 1,
        monthlyContribution: 100,
        numParcela: 10
      };

      const useCaseWithError = new CreateGoalUseCase(errorRepository);

      const result = await useCaseWithError.execute(goalData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create goal');
    });
  });
});