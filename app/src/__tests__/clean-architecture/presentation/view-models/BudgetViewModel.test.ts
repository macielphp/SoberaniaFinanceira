import { BudgetViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result } from '../../../../clean-architecture/shared/utils/Result';

// Mock repositories
const mockBudgetRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  findActiveByUser: jest.fn(),
  findByDateRange: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn(),
};

const mockBudgetItemRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByBudget: jest.fn(),
  findByCategory: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn(),
};

describe('BudgetViewModel', () => {
  let viewModel: BudgetViewModel;
  let mockBudget: Budget;

  beforeEach(() => {
    jest.clearAllMocks();
    
    viewModel = new BudgetViewModel(mockBudgetRepository, mockBudgetItemRepository);
    
    mockBudget = new Budget({
      id: 'budget-123',
      userId: 'user-456',
      name: 'Orçamento Janeiro 2024',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-01-31'),
      type: 'manual',
      totalPlannedValue: new Money(5000, 'BRL')
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty budgets array', () => {
      expect(viewModel.budgets).toEqual([]);
    });

    it('should initialize with loading false', () => {
      expect(viewModel.loading).toBe(false);
    });

    it('should initialize with error null', () => {
      expect(viewModel.error).toBeNull();
    });

    it('should initialize with selectedBudget null', () => {
      expect(viewModel.selectedBudget).toBeNull();
    });
  });

  describe('loadBudgets', () => {
    it('should load budgets successfully', async () => {
      const mockBudgets = [mockBudget];
      mockBudgetRepository.findAll.mockResolvedValue(mockBudgets);

      await viewModel.loadBudgets();

      expect(viewModel.budgets).toEqual(mockBudgets);
      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBeNull();
      expect(mockBudgetRepository.findAll).toHaveBeenCalled();
    });

    it('should handle error when loading budgets fails', async () => {
      const errorMessage = 'Failed to load budgets';
      mockBudgetRepository.findAll.mockRejectedValue(new Error(errorMessage));

      await viewModel.loadBudgets();

      expect(viewModel.budgets).toEqual([]);
      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBe(errorMessage);
    });

    it('should set loading to true during operation', async () => {
      mockBudgetRepository.findAll.mockResolvedValue([]);

      const loadPromise = viewModel.loadBudgets();
      
      expect(viewModel.loading).toBe(true);
      
      await loadPromise;
      
      expect(viewModel.loading).toBe(false);
    });
  });

  describe('loadBudgetsByUser', () => {
    it('should load budgets by user successfully', async () => {
      const userId = 'user-456';
      const mockBudgets = [mockBudget];
      mockBudgetRepository.findByUser.mockResolvedValue(mockBudgets);

      await viewModel.loadBudgetsByUser(userId);

      expect(viewModel.budgets).toEqual(mockBudgets);
      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBeNull();
      expect(mockBudgetRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should handle error when loading budgets by user fails', async () => {
      const userId = 'user-456';
      const errorMessage = 'Failed to load user budgets';
      mockBudgetRepository.findByUser.mockRejectedValue(new Error(errorMessage));

      await viewModel.loadBudgetsByUser(userId);

      expect(viewModel.budgets).toEqual([]);
      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      const createData = {
        userId: 'user-456',
        name: 'Novo Orçamento',
        startPeriod: new Date('2024-02-01'),
        endPeriod: new Date('2024-02-29'),
        type: 'manual' as const,
        totalPlannedValue: new Money(3000, 'BRL')
      };

      mockBudgetRepository.save.mockResolvedValue(mockBudget);

      const result = await viewModel.createBudget(createData);

      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(mockBudget);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when creating budget fails', async () => {
      const createData = {
        userId: 'user-456',
        name: 'Novo Orçamento',
        startPeriod: new Date('2024-02-01'),
        endPeriod: new Date('2024-02-29'),
        type: 'manual' as const,
        totalPlannedValue: new Money(3000, 'BRL')
      };

      const errorMessage = 'Failed to create budget';
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await viewModel.createBudget(createData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create budget');
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const budgetId = 'budget-123';
      const updateData = {
        name: 'Orçamento Atualizado',
        totalPlannedValue: new Money(6000, 'BRL')
      };

      const updatedBudget = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: 'Orçamento Atualizado',
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: new Money(6000, 'BRL'),
        isActive: mockBudget.isActive,
        status: mockBudget.status,
        createdAt: mockBudget.createdAt
      });

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(updatedBudget);

      const result = await viewModel.updateBudget(budgetId, updateData);

      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(updatedBudget);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when updating budget fails', async () => {
      const budgetId = 'budget-123';
      const updateData = {
        name: 'Orçamento Atualizado'
      };

      const errorMessage = 'Failed to update budget';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await viewModel.updateBudget(budgetId, updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update budget');
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      const budgetId = 'budget-123';
      mockBudgetRepository.delete.mockResolvedValue(true);

      const result = await viewModel.deleteBudget(budgetId);

      expect(mockBudgetRepository.delete).toHaveBeenCalledWith(budgetId);
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toBe(true);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when deleting budget fails', async () => {
      const budgetId = 'budget-123';
      const errorMessage = 'Failed to delete budget';
      mockBudgetRepository.delete.mockRejectedValue(new Error(errorMessage));

      const result = await viewModel.deleteBudget(budgetId);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete budget');
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('activateBudget', () => {
    it('should activate budget successfully', async () => {
      const budgetId = 'budget-123';
      const activatedBudget = mockBudget.activate();
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(activatedBudget);

      const result = await viewModel.activateBudget(budgetId);

      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(activatedBudget);
      expect(result.getOrThrow()?.isActive).toBe(true);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when activating budget fails', async () => {
      const budgetId = 'budget-123';
      const errorMessage = 'Failed to activate budget';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await viewModel.activateBudget(budgetId);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to activate budget');
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('deactivateBudget', () => {
    it('should deactivate budget successfully', async () => {
      const budgetId = 'budget-123';
      const deactivatedBudget = mockBudget.deactivate();
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(deactivatedBudget);

      const result = await viewModel.deactivateBudget(budgetId);

      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(deactivatedBudget);
      expect(result.getOrThrow()?.isActive).toBe(false);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when deactivating budget fails', async () => {
      const budgetId = 'budget-123';
      const errorMessage = 'Failed to deactivate budget';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await viewModel.deactivateBudget(budgetId);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to deactivate budget');
      expect(viewModel.error).toBe(errorMessage);
    });
  });

  describe('selectBudget', () => {
    it('should select budget successfully', async () => {
      const budgetId = 'budget-123';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);

      await viewModel.selectBudget(budgetId);

      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
      expect(viewModel.selectedBudget).toEqual(mockBudget);
      expect(viewModel.error).toBeNull();
    });

    it('should handle error when selecting budget fails', async () => {
      const budgetId = 'budget-123';
      const errorMessage = 'Failed to find budget';
      mockBudgetRepository.findById.mockRejectedValue(new Error(errorMessage));

      await viewModel.selectBudget(budgetId);

      expect(viewModel.selectedBudget).toBeNull();
      expect(viewModel.error).toBe(errorMessage);
    });

    it('should handle budget not found', async () => {
      const budgetId = 'budget-123';
      mockBudgetRepository.findById.mockResolvedValue(null);

      await viewModel.selectBudget(budgetId);

      expect(viewModel.selectedBudget).toBeNull();
      expect(viewModel.error).toBe('Budget not found');
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      viewModel.error = 'Some error';
      
      viewModel.clearError();
      
      expect(viewModel.error).toBeNull();
    });
  });

  describe('getActiveBudget', () => {
    it('should return active budget from budgets array', () => {
      const activeBudget = mockBudget.activate();
      const inactiveBudget = mockBudget.deactivate();
      
      viewModel.budgets = [inactiveBudget, activeBudget];

      const result = viewModel.getActiveBudget();

      expect(result).toEqual(activeBudget);
    });

    it('should return null when no active budget exists', () => {
      const inactiveBudget = mockBudget.deactivate();
      viewModel.budgets = [inactiveBudget];

      const result = viewModel.getActiveBudget();

      expect(result).toBeNull();
    });

    it('should return null when budgets array is empty', () => {
      viewModel.budgets = [];

      const result = viewModel.getActiveBudget();

      expect(result).toBeNull();
    });
  });

  describe('getBudgetById', () => {
    it('should return budget by id', () => {
      const budgetId = 'budget-123';
      viewModel.budgets = [mockBudget];

      const result = viewModel.getBudgetById(budgetId);

      expect(result).toEqual(mockBudget);
    });

    it('should return null when budget not found', () => {
      const budgetId = 'non-existent';
      viewModel.budgets = [mockBudget];

      const result = viewModel.getBudgetById(budgetId);

      expect(result).toBeNull();
    });
  });
});
