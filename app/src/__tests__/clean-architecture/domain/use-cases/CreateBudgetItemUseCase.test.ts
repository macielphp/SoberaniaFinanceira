import { CreateBudgetItemUseCase } from '../../../../clean-architecture/domain/use-cases/CreateBudgetItemUseCase';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';

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

// Mock EventBus
const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  clear: jest.fn(),
  getHandlerCount: jest.fn(),
  hasHandlers: jest.fn(),
  getEventNames: jest.fn(),
} as unknown as jest.Mocked<EventBus>;

describe('CreateBudgetItemUseCase', () => {
  let createBudgetItemUseCase: CreateBudgetItemUseCase;
  let mockBudgetItem: BudgetItem;

  beforeEach(() => {
    jest.clearAllMocks();
    
    createBudgetItemUseCase = new CreateBudgetItemUseCase(mockBudgetItemRepository, mockEventBus);
    
    mockBudgetItem = new BudgetItem({
      id: 'budget-item-123',
      budgetId: 'budget-456',
      categoryName: 'Alimentação',
      categoryType: 'expense',
      plannedValue: new Money(1000, 'BRL'),
      actualValue: new Money(800, 'BRL')
    });
  });

  describe('execute', () => {
    it('should create budget item successfully', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      mockBudgetItemRepository.save.mockResolvedValue(mockBudgetItem);

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgetItem).toEqual(mockBudgetItem);
      expect(mockBudgetItemRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetItemCreated', expect.any(Object));
    });

    it('should fail when budget ID is empty', async () => {
      const request = {
        budgetId: '',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetItemRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should fail when category name is empty', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: '',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget item name cannot be empty');
      expect(mockBudgetItemRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should fail when planned value is zero or negative', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(0, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget item planned value cannot be zero or negative');
      expect(mockBudgetItemRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should fail when planned value is zero', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(0, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget item planned value cannot be zero or negative');
      expect(mockBudgetItemRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      const errorMessage = 'Database connection failed';
      mockBudgetItemRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await createBudgetItemUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create budget item');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should work without EventBus', async () => {
      const useCaseWithoutEventBus = new CreateBudgetItemUseCase(mockBudgetItemRepository);
      
      const request = {
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        categoryType: 'expense' as const,
        plannedValue: new Money(1000, 'BRL'),
        actualValue: new Money(800, 'BRL')
      };

      mockBudgetItemRepository.save.mockResolvedValue(mockBudgetItem);

      const result = await useCaseWithoutEventBus.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgetItem).toEqual(mockBudgetItem);
      expect(mockBudgetItemRepository.save).toHaveBeenCalled();
    });
  });
});
