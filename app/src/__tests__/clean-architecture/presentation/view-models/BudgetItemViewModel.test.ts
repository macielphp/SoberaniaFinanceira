import { BudgetItemViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetItemViewModel';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { CreateBudgetItemUseCase } from '../../../../clean-architecture/domain/use-cases/CreateBudgetItemUseCase';
import { GetBudgetItemsUseCase } from '../../../../clean-architecture/domain/use-cases/GetBudgetItemsUseCase';

// Mock Use Cases
const mockCreateBudgetItemUseCase = {
  execute: jest.fn(),
};

const mockGetBudgetItemsUseCase = {
  execute: jest.fn(),
};

describe('BudgetItemViewModel', () => {
  let budgetItemViewModel: BudgetItemViewModel;
  let mockBudgetItems: BudgetItem[];

  beforeEach(() => {
    jest.clearAllMocks();

    budgetItemViewModel = new BudgetItemViewModel(
      mockCreateBudgetItemUseCase as any,
      mockGetBudgetItemsUseCase as any
    );

    mockBudgetItems = [
      new BudgetItem({
        id: 'budget-item-1',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense',
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      }),
      new BudgetItem({
        id: 'budget-item-2',
        budgetId: 'budget-456',
        categoryName: 'Transporte',
        categoryType: 'expense',
        plannedValue: new Money(500, 'BRL'),
        actualValue: new Money(450, 'BRL')
      })
    ];
  });

  describe('createBudgetItem', () => {
    it('should create budget item successfully', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const response = { budgetItem: mockBudgetItems[0] };
      mockCreateBudgetItemUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.createBudgetItem(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockCreateBudgetItemUseCase.execute).toHaveBeenCalledWith(request);
    });

    it('should handle creation failure', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const error = new Error('Validation failed');
      mockCreateBudgetItemUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await budgetItemViewModel.createBudgetItem(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Validation failed');
    });
  });

  describe('getBudgetItems', () => {
    it('should get all budget items when no filters provided', async () => {
      const response = { budgetItems: mockBudgetItems };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItems({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should get budget items by budget ID', async () => {
      const budgetId = 'budget-456';
      const response = { budgetItems: mockBudgetItems };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItems({ budgetId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({ budgetId });
    });

    it('should get budget items by category', async () => {
      const categoryName = 'Alimentação';
      const response = { budgetItems: [mockBudgetItems[0]] };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItems({ categoryName });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({ categoryName });
    });

    it('should get budget items by budget ID and category', async () => {
      const budgetId = 'budget-456';
      const categoryName = 'Alimentação';
      const response = { budgetItems: [mockBudgetItems[0]] };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItems({ budgetId, categoryName });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({ budgetId, categoryName });
    });

    it('should handle get failure', async () => {
      const error = new Error('Database connection failed');
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await budgetItemViewModel.getBudgetItems({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Database connection failed');
    });
  });

  describe('getBudgetItemsByBudget', () => {
    it('should get budget items by budget ID', async () => {
      const budgetId = 'budget-456';
      const response = { budgetItems: mockBudgetItems };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItemsByBudget(budgetId);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({ budgetId });
    });

    it('should handle empty budget ID', async () => {
      const budgetId = '';
      const error = new Error('Budget ID cannot be empty');
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await budgetItemViewModel.getBudgetItemsByBudget(budgetId);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
    });
  });

  describe('getBudgetItemsByCategory', () => {
    it('should get budget items by category', async () => {
      const categoryName = 'Alimentação';
      const response = { budgetItems: [mockBudgetItems[0]] };
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await budgetItemViewModel.getBudgetItemsByCategory(categoryName);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetBudgetItemsUseCase.execute).toHaveBeenCalledWith({ categoryName });
    });

    it('should handle empty category name', async () => {
      const categoryName = '';
      const error = new Error('Category name cannot be empty');
      mockGetBudgetItemsUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await budgetItemViewModel.getBudgetItemsByCategory(categoryName);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category name cannot be empty');
    });
  });
});
