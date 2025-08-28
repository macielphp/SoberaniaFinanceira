import { GetBudgetItemsUseCase } from '../../../../clean-architecture/domain/use-cases/GetBudgetItemsUseCase';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository
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

describe('GetBudgetItemsUseCase', () => {
  let getBudgetItemsUseCase: GetBudgetItemsUseCase;
  let mockBudgetItems: BudgetItem[];

  beforeEach(() => {
    jest.clearAllMocks();
    
    getBudgetItemsUseCase = new GetBudgetItemsUseCase(mockBudgetItemRepository);
    
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

  describe('execute', () => {
    it('should get all budget items when no filters provided', async () => {
      mockBudgetItemRepository.findAll.mockResolvedValue(mockBudgetItems);

      const result = await getBudgetItemsUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const returnedItems = result.getOrThrow().budgetItems;
      expect(returnedItems).toHaveLength(mockBudgetItems.length);
      expect(returnedItems[0].id).toBe(mockBudgetItems[0].id);
      expect(returnedItems[1].id).toBe(mockBudgetItems[1].id);
      expect(mockBudgetItemRepository.findAll).toHaveBeenCalled();
    });

    it('should get budget items by budget ID', async () => {
      const budgetId = 'budget-456';
      mockBudgetItemRepository.findByBudget.mockResolvedValue(mockBudgetItems);

      const result = await getBudgetItemsUseCase.execute({ budgetId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgetItems).toEqual(mockBudgetItems);
      expect(mockBudgetItemRepository.findByBudget).toHaveBeenCalledWith(budgetId);
    });

    it('should get budget items by category', async () => {
      const categoryName = 'Alimentação';
      const filteredItems = [mockBudgetItems[0]];
      mockBudgetItemRepository.findByCategory.mockResolvedValue(filteredItems);

      const result = await getBudgetItemsUseCase.execute({ categoryName });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgetItems).toEqual(filteredItems);
      expect(mockBudgetItemRepository.findByCategory).toHaveBeenCalledWith(categoryName);
    });

    it('should get budget items by budget ID and category', async () => {
      const budgetId = 'budget-456';
      const categoryName = 'Alimentação';
      const filteredItems = [mockBudgetItems[0]];
      mockBudgetItemRepository.findByBudget.mockResolvedValue(mockBudgetItems);
      mockBudgetItemRepository.findByCategory.mockResolvedValue(filteredItems);

      const result = await getBudgetItemsUseCase.execute({ budgetId, categoryName });

      expect(result.isSuccess()).toBe(true);
      // Should return intersection of both filters
      expect(result.getOrThrow().budgetItems).toHaveLength(1);
      expect(result.getOrThrow().budgetItems[0].id).toBe('budget-item-1');
      expect(mockBudgetItemRepository.findByBudget).toHaveBeenCalledWith(budgetId);
      expect(mockBudgetItemRepository.findByCategory).toHaveBeenCalledWith(categoryName);
    });

    it('should return empty array when no budget items found', async () => {
      mockBudgetItemRepository.findAll.mockResolvedValue([]);

      const result = await getBudgetItemsUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgetItems).toEqual([]);
      expect(mockBudgetItemRepository.findAll).toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const errorMessage = 'Database connection failed';
      mockBudgetItemRepository.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await getBudgetItemsUseCase.execute({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get budget items');
    });

    it('should handle empty budget ID gracefully', async () => {
      const budgetId = '';

      const result = await getBudgetItemsUseCase.execute({ budgetId });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetItemRepository.findByBudget).not.toHaveBeenCalled();
    });

    it('should handle empty category name gracefully', async () => {
      const categoryName = '';

      const result = await getBudgetItemsUseCase.execute({ categoryName });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category name cannot be empty');
      expect(mockBudgetItemRepository.findByCategory).not.toHaveBeenCalled();
    });
  });
});
