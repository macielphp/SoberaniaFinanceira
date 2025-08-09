import { GoalViewModel } from '../../../../clean-architecture/presentation/view-models/GoalViewModel';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result, success, failure } from '../../../../clean-architecture/shared/utils/Result';

// Mock dos Use Cases
const mockCreateGoalUseCase = {
  execute: jest.fn(),
};

const mockUpdateGoalUseCase = {
  execute: jest.fn(),
};

const mockDeleteGoalUseCase = {
  execute: jest.fn(),
};

const mockGetGoalByIdUseCase = {
  execute: jest.fn(),
};

const mockGetGoalsUseCase = {
  execute: jest.fn(),
};

jest.mock('../../../../clean-architecture/domain/use-cases/CreateGoalUseCase', () => ({
  CreateGoalUseCase: jest.fn(() => mockCreateGoalUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/UpdateGoalUseCase', () => ({
  UpdateGoalUseCase: jest.fn(() => mockUpdateGoalUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/DeleteGoalUseCase', () => ({
  DeleteGoalUseCase: jest.fn(() => mockDeleteGoalUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetGoalByIdUseCase', () => ({
  GetGoalByIdUseCase: jest.fn(() => mockGetGoalByIdUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetGoalsUseCase', () => ({
  GetGoalsUseCase: jest.fn(() => mockGetGoalsUseCase),
}));

describe('GoalViewModel', () => {
  let goalViewModel: GoalViewModel;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockGoalRepository = {} as any;
    goalViewModel = new GoalViewModel(mockGoalRepository);
  });

  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      const goalData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const createdGoal = new Goal({
        id: 'goal-1',
        ...goalData,
        createdAt: new Date(),
      });

      mockCreateGoalUseCase.execute.mockResolvedValue(createdGoal);

      const result = await goalViewModel.createGoal(goalData);

      expect(mockCreateGoalUseCase.execute).toHaveBeenCalledWith(goalData);
      expect(result).toEqual(createdGoal);
      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const goalData = {
        userId: 'user-1',
        description: '',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const error = new Error('Descrição da meta é obrigatória');
      mockCreateGoalUseCase.execute.mockRejectedValue(error);

      await expect(goalViewModel.createGoal(goalData)).rejects.toThrow('Descrição da meta é obrigatória');

      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBe('Descrição da meta é obrigatória');
    });
  });

  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      const goalId = 'goal-1';
      const updateData = {
        description: 'Comprar Carro Atualizado',
        targetValue: new Money(60000),
      };

      const updatedGoal = new Goal({
        id: goalId,
        userId: 'user-1',
        description: 'Comprar Carro Atualizado',
        type: 'compra',
        targetValue: new Money(60000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active',
        createdAt: new Date(),
      });

      mockUpdateGoalUseCase.execute.mockResolvedValue(updatedGoal);

      const result = await goalViewModel.updateGoal(goalId, updateData);

      expect(mockUpdateGoalUseCase.execute).toHaveBeenCalledWith(goalId, updateData);
      expect(result).toEqual(updatedGoal);
      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBeNull();
    });

    it('should handle update error', async () => {
      const goalId = 'goal-1';
      const updateData = {
        description: '',
      };

      const error = new Error('Descrição da meta é obrigatória');
      mockUpdateGoalUseCase.execute.mockRejectedValue(error);

      await expect(goalViewModel.updateGoal(goalId, updateData)).rejects.toThrow('Descrição da meta é obrigatória');

      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBe('Descrição da meta é obrigatória');
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      const goalId = 'goal-1';

      mockDeleteGoalUseCase.execute.mockResolvedValue(
        success({ deleted: true })
      );

      const result = await goalViewModel.deleteGoal(goalId);

      expect(mockDeleteGoalUseCase.execute).toHaveBeenCalledWith(goalId);
      expect(result).toBe(true);
      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const goalId = 'goal-1';

      const error = new Error('Meta não encontrada');
      mockDeleteGoalUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(goalViewModel.deleteGoal(goalId)).rejects.toThrow('Meta não encontrada');

      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBe('Meta não encontrada');
    });
  });

  describe('getGoalById', () => {
    it('should get goal by id successfully', async () => {
      const goalId = 'goal-1';
      const goal = new Goal({
        id: goalId,
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active',
        createdAt: new Date(),
      });

      mockGetGoalByIdUseCase.execute.mockResolvedValue(
        success({ goal })
      );

      const result = await goalViewModel.getGoalById(goalId);

      expect(mockGetGoalByIdUseCase.execute).toHaveBeenCalledWith(goalId);
      expect(result).toEqual(goal);
      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBeNull();
    });

    it('should handle get goal error', async () => {
      const goalId = 'goal-1';

      const error = new Error('Meta não encontrada');
      mockGetGoalByIdUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(goalViewModel.getGoalById(goalId)).rejects.toThrow('Meta não encontrada');

      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBe('Meta não encontrada');
    });
  });

  describe('getAllGoals', () => {
    it('should get all goals successfully', async () => {
      const goals = [
        new Goal({
          id: 'goal-1',
          userId: 'user-1',
          description: 'Comprar Carro',
      type: 'compra',
          targetValue: new Money(50000),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          monthlyIncome: new Money(5000),
          fixedExpenses: new Money(2000),
          availablePerMonth: new Money(3000),
          importance: 'alta',
          priority: 1,
          strategy: 'guardar',
          monthlyContribution: new Money(2500),
          numParcela: 20,
          status: 'active',
          createdAt: new Date(),
        }),
        new Goal({
          id: 'goal-2',
          userId: 'user-1',
          description: 'Viagem para Europa',
          type: 'economia',
          targetValue: new Money(30000),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-06-30'),
          monthlyIncome: new Money(5000),
          fixedExpenses: new Money(2000),
          availablePerMonth: new Money(3000),
      importance: 'média',
      priority: 2,
      strategy: 'guardar',
          monthlyContribution: new Money(1500),
          numParcela: 18,
      status: 'active',
          createdAt: new Date(),
        }),
      ];

      mockGetGoalsUseCase.execute.mockResolvedValue(
        success({ goals, total: 2 })
      );

      const result = await goalViewModel.getAllGoals();

      expect(mockGetGoalsUseCase.execute).toHaveBeenCalledWith();
      expect(result).toEqual(goals);
      expect(goalViewModel.goals).toEqual(goals);
      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBeNull();
    });

    it('should handle get all goals error', async () => {
      const error = 'Erro ao carregar metas';
      mockGetGoalsUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(goalViewModel.getAllGoals()).rejects.toThrow('Erro ao carregar metas');

      expect(goalViewModel.loading).toBe(false);
      expect(goalViewModel.error).toBe('Erro ao carregar metas');
    });
  });

  describe('validateForm', () => {
    it('should return true for valid goal data', () => {
      const validData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'), // Data futura
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const result = goalViewModel.validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return false for invalid description', () => {
      const invalidData = {
        userId: 'user-1',
        description: '',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const result = goalViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Descrição da meta é obrigatória');
    });

    it('should return false for invalid target value', () => {
      const invalidData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(0),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const result = goalViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.targetValue).toBe('Valor alvo deve ser maior que zero');
    });

    it('should return false for invalid end date', () => {
      const invalidData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2020-01-01'), // Data passada
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const result = goalViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBe('Data limite deve ser futura');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active',
        createdAt: new Date(),
      });

      const currentValue = new Money(25000);
      const progress = goalViewModel.calculateProgress(goal, currentValue);
      expect(progress).toBe(50); // 50%
    });

    it('should return 0 for zero target value', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(0),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active',
        createdAt: new Date(),
      });

      const currentValue = new Money(25000);
      const progress = goalViewModel.calculateProgress(goal, currentValue);
      expect(progress).toBe(0);
    });

    it('should return 100 for completed goal', () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
      status: 'active',
        createdAt: new Date(),
      });

      const currentValue = new Money(50000);
      const progress = goalViewModel.calculateProgress(goal, currentValue);
      expect(progress).toBe(100);
    });
  });

  describe('state management', () => {
    it('should set loading state during operations', async () => {
      const goalData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const createdGoal = new Goal({
        id: 'goal-1',
        ...goalData,
        createdAt: new Date(),
      });

      mockCreateGoalUseCase.execute.mockResolvedValue(createdGoal);

      // Simulate async operation
      const createPromise = goalViewModel.createGoal(goalData);
      
      expect(goalViewModel.loading).toBe(true);
      
      await createPromise;
      
      expect(goalViewModel.loading).toBe(false);
    });

    it('should clear error when operation succeeds', async () => {
      // Set initial error
      goalViewModel.setError('Erro anterior');

      const goalData = {
        userId: 'user-1',
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'guardar',
        monthlyContribution: new Money(2500),
        numParcela: 20,
        status: 'active' as const,
      };

      const createdGoal = new Goal({
        id: 'goal-1',
        ...goalData,
        createdAt: new Date(),
      });

      mockCreateGoalUseCase.execute.mockResolvedValue(createdGoal);

      await goalViewModel.createGoal(goalData);

      expect(goalViewModel.error).toBeNull();
    });
  });
});