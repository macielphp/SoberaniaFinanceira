import { BudgetViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result, success, failure } from '../../../../clean-architecture/shared/utils/Result';

// Mock dos Use Cases
const mockCreateBudgetUseCase = {
  execute: jest.fn(),
};

const mockUpdateBudgetUseCase = {
  execute: jest.fn(),
};

const mockDeleteBudgetUseCase = {
  execute: jest.fn(),
};

const mockGetBudgetsUseCase = {
  execute: jest.fn(),
};

const mockGetBudgetByIdUseCase = {
  execute: jest.fn(),
};

const mockActivateBudgetUseCase = {
  execute: jest.fn(),
};

jest.mock('../../../../clean-architecture/domain/use-cases/CreateBudgetUseCase', () => ({
  CreateBudgetUseCase: jest.fn(() => mockCreateBudgetUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/UpdateBudgetUseCase', () => ({
  UpdateBudgetUseCase: jest.fn(() => mockUpdateBudgetUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/DeleteBudgetUseCase', () => ({
  DeleteBudgetUseCase: jest.fn(() => mockDeleteBudgetUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetBudgetsUseCase', () => ({
  GetBudgetsUseCase: jest.fn(() => mockGetBudgetsUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetBudgetByIdUseCase', () => ({
  GetBudgetByIdUseCase: jest.fn(() => mockGetBudgetByIdUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/ActivateBudgetUseCase', () => ({
  ActivateBudgetUseCase: jest.fn(() => mockActivateBudgetUseCase),
}));

describe('BudgetViewModel', () => {
  let budgetViewModel: BudgetViewModel;

  const mockBudget = new Budget({
    id: '1',
    userId: 'user1',
    name: 'Orçamento Mensal',
    startPeriod: new Date('2024-01-01'),
    endPeriod: new Date('2024-01-31'),
    type: 'manual',
    totalPlannedValue: new Money(5000),
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const mockBudgetRepository = {} as any;
    budgetViewModel = new BudgetViewModel(mockBudgetRepository);
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(budgetViewModel.budgets).toEqual([]);
      expect(budgetViewModel.currentBudget).toBeNull();
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });
  });

  describe('loadBudgets', () => {
    it('should load budgets successfully', async () => {
      const mockBudgets = [mockBudget];
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: mockBudgets }));

      await budgetViewModel.loadBudgets('user1');

      expect(mockGetBudgetsUseCase.execute).toHaveBeenCalledWith({ userId: 'user1' });
      expect(budgetViewModel.budgets).toEqual(mockBudgets);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when loading budgets fails', async () => {
      const errorMessage = 'Failed to load budgets';
      mockGetBudgetsUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await budgetViewModel.loadBudgets('user1');

      expect(budgetViewModel.budgets).toEqual([]);
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      const budgetData = {
        userId: 'user1',
        name: 'Novo Orçamento',
        startPeriod: new Date('2024-02-01'),
        endPeriod: new Date('2024-02-29'),
        type: 'manual' as const,
        totalPlannedValue: new Money(6000),
      };

      const newBudget = new Budget({
        id: '2',
        ...budgetData,
        isActive: true,
        status: 'active',
        createdAt: new Date(),
      });

      mockCreateBudgetUseCase.execute.mockResolvedValue(success({ budget: newBudget }));

      const result = await budgetViewModel.createBudget(budgetData);

      expect(mockCreateBudgetUseCase.execute).toHaveBeenCalledWith(budgetData);
      expect(result).toEqual(newBudget);
      expect(budgetViewModel.budgets).toContain(newBudget);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when creating budget fails', async () => {
      const budgetData = {
        userId: 'user1',
        name: 'Novo Orçamento',
        startPeriod: new Date('2024-02-01'),
        endPeriod: new Date('2024-02-29'),
        type: 'manual' as const,
        totalPlannedValue: new Money(6000),
      };

      const errorMessage = 'Failed to create budget';
      mockCreateBudgetUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await expect(budgetViewModel.createBudget(budgetData)).rejects.toThrow(errorMessage);
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const updateData = {
        name: 'Orçamento Atualizado',
        totalPlannedValue: new Money(7000),
      };

      const updatedBudget = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: updateData.name || mockBudget.name,
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: updateData.totalPlannedValue || mockBudget.totalPlannedValue,
        isActive: mockBudget.isActive,
        status: mockBudget.status,
        createdAt: mockBudget.createdAt,
      });

      mockUpdateBudgetUseCase.execute.mockResolvedValue(success({ budget: updatedBudget }));

      const result = await budgetViewModel.updateBudget('1', updateData);

      expect(mockUpdateBudgetUseCase.execute).toHaveBeenCalledWith({ budgetId: '1', ...updateData });
      expect(result).toEqual(updatedBudget);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when updating budget fails', async () => {
      const updateData = { name: 'Orçamento Atualizado' };
      const errorMessage = 'Failed to update budget';
      mockUpdateBudgetUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await expect(budgetViewModel.updateBudget('1', updateData)).rejects.toThrow(errorMessage);
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      mockDeleteBudgetUseCase.execute.mockResolvedValue(success({ success: true }));

      const result = await budgetViewModel.deleteBudget('1');

      expect(mockDeleteBudgetUseCase.execute).toHaveBeenCalledWith({ budgetId: '1' });
      expect(result).toBe(true);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when deleting budget fails', async () => {
      const errorMessage = 'Failed to delete budget';
      mockDeleteBudgetUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await expect(budgetViewModel.deleteBudget('1')).rejects.toThrow(errorMessage);
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('getBudgetById', () => {
    it('should get budget by id successfully', async () => {
      mockGetBudgetByIdUseCase.execute.mockResolvedValue(success({ budget: mockBudget }));

      const result = await budgetViewModel.getBudgetById('1');

      expect(mockGetBudgetByIdUseCase.execute).toHaveBeenCalledWith({ budgetId: '1' });
      expect(result).toEqual(mockBudget);
      expect(budgetViewModel.currentBudget).toEqual(mockBudget);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when getting budget by id fails', async () => {
      const errorMessage = 'Budget not found';
      mockGetBudgetByIdUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await expect(budgetViewModel.getBudgetById('1')).rejects.toThrow(errorMessage);
      expect(budgetViewModel.currentBudget).toBeNull();
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('activateBudget', () => {
    it('should activate budget successfully', async () => {
      const activatedBudget = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: mockBudget.name,
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: mockBudget.totalPlannedValue,
        isActive: true,
        status: 'active',
        createdAt: mockBudget.createdAt,
      });

      mockActivateBudgetUseCase.execute.mockResolvedValue(success({ budget: activatedBudget }));

      const result = await budgetViewModel.activateBudget('1');

      expect(mockActivateBudgetUseCase.execute).toHaveBeenCalledWith({ budgetId: '1' });
      expect(result).toEqual(activatedBudget);
      expect(budgetViewModel.loading).toBe(false);
      expect(budgetViewModel.error).toBeNull();
    });

    it('should handle error when activating budget fails', async () => {
      const errorMessage = 'Failed to activate budget';
      mockActivateBudgetUseCase.execute.mockResolvedValue(failure(new Error(errorMessage)));

      await expect(budgetViewModel.activateBudget('1')).rejects.toThrow(errorMessage);
      expect(budgetViewModel.error).toBe(errorMessage);
      expect(budgetViewModel.loading).toBe(false);
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      const activeBudget = new Budget({
        id: '1',
        userId: 'user1',
        name: 'Orçamento Ativo',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(5000),
        isActive: true,
        status: 'active',
        createdAt: new Date('2024-01-01'),
      });

      const inactiveBudget = new Budget({
        id: '2',
        userId: 'user1',
        name: 'Orçamento Inativo',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(3000),
        isActive: false,
        status: 'inactive',
        createdAt: new Date('2024-01-01'),
      });

      budgetViewModel.budgets = [activeBudget, inactiveBudget];
    });

    it('should get active budgets', () => {
      const activeBudgets = budgetViewModel.getActiveBudgets();
      expect(activeBudgets).toHaveLength(1);
      expect(activeBudgets[0].isActive).toBe(true);
    });

    it('should get budgets by type', () => {
      const manualBudgets = budgetViewModel.getBudgetsByType('manual');
      expect(manualBudgets).toHaveLength(2);
      expect(manualBudgets.every(budget => budget.type === 'manual')).toBe(true);
    });

    it('should get budgets by date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const budgetsInRange = budgetViewModel.getBudgetsByDateRange(startDate, endDate);
      expect(budgetsInRange).toHaveLength(2);
    });

    it('should get budgets by status', () => {
      const activeBudgets = budgetViewModel.getBudgetsByStatus('active');
      expect(activeBudgets).toHaveLength(1);
      expect(activeBudgets[0].status).toBe('active');
    });

    it('should calculate total planned value', () => {
      const total = budgetViewModel.getTotalPlannedValue();
      expect(total).toBe(8000); // 5000 + 3000
    });

    it('should calculate total planned value by type', () => {
      const total = budgetViewModel.getTotalPlannedValueByType('manual');
      expect(total).toBe(8000);
    });

    it('should get budgets count', () => {
      expect(budgetViewModel.getBudgetsCount()).toBe(2);
    });

    it('should get active budgets count', () => {
      expect(budgetViewModel.getActiveBudgetsCount()).toBe(1);
    });

    it('should check if has active budgets', () => {
      expect(budgetViewModel.hasActiveBudgets()).toBe(true);
    });

    it('should check if budget is active', () => {
      expect(budgetViewModel.isBudgetActive('1')).toBe(true);
      expect(budgetViewModel.isBudgetActive('2')).toBe(false);
      expect(budgetViewModel.isBudgetActive('3')).toBe(false);
    });

    it('should get budget by id synchronously', () => {
      const budget = budgetViewModel.getBudgetByIdSync('1');
      expect(budget).toEqual(budgetViewModel.budgets[0]);
      
      const notFound = budgetViewModel.getBudgetByIdSync('3');
      expect(notFound).toBeNull();
    });
  });

  describe('state management', () => {
    it('should clear error', () => {
      budgetViewModel.error = 'Test error';
      budgetViewModel.clearError();
      expect(budgetViewModel.error).toBeNull();
    });

    it('should set current budget', () => {
      budgetViewModel.setCurrentBudget(mockBudget);
      expect(budgetViewModel.currentBudget).toEqual(mockBudget);
      
      budgetViewModel.setCurrentBudget(null);
      expect(budgetViewModel.currentBudget).toBeNull();
    });
  });
});