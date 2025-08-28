import { DeleteBudgetUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteBudgetUseCase';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';

// Mock repository
const mockBudgetRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  findByStatus: jest.fn(),
  findActiveByUser: jest.fn(),
  findByDateRange: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn(),
};

// Mock event bus
const mockEventBus = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  publish: jest.fn(),
  clear: jest.fn(),
  getHandlerCount: jest.fn(),
  hasHandlers: jest.fn(),
  getEventNames: jest.fn(),
} as unknown as jest.Mocked<EventBus>;

describe('DeleteBudgetUseCase', () => {
  let deleteBudgetUseCase: DeleteBudgetUseCase;
  let mockBudget: Budget;

  beforeEach(() => {
    jest.clearAllMocks();
    
    deleteBudgetUseCase = new DeleteBudgetUseCase(mockBudgetRepository, mockEventBus);
    
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

  describe('execute', () => {
    it('should delete budget successfully', async () => {
      const request = {
        budgetId: 'budget-123'
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.delete.mockResolvedValue(undefined);

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.delete).toHaveBeenCalledWith('budget-123');
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetDeleted', expect.any(Object));
    });

    it('should handle empty budget ID', async () => {
      const request = {
        budgetId: ''
      };

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle null budget ID', async () => {
      const request = {
        budgetId: null as any
      };

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle undefined budget ID', async () => {
      const request = {
        budgetId: undefined as any
      };

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle budget not found', async () => {
      const request = {
        budgetId: 'budget-999'
      };

      mockBudgetRepository.findById.mockResolvedValue(null);

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget not found');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-999');
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error during find', async () => {
      const request = {
        budgetId: 'budget-123'
      };

      const errorMessage = 'Database connection failed';
      mockBudgetRepository.findById.mockRejectedValue(new Error(errorMessage));

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete budget');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error during delete', async () => {
      const request = {
        budgetId: 'budget-123'
      };

      const errorMessage = 'Delete operation failed';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.delete.mockRejectedValue(new Error(errorMessage));

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete budget');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.delete).toHaveBeenCalledWith('budget-123');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle whitespace budget ID', async () => {
      const request = {
        budgetId: '   '
      };

      const result = await deleteBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should work without event bus', async () => {
      const useCaseWithoutEventBus = new DeleteBudgetUseCase(mockBudgetRepository);
      
      const request = {
        budgetId: 'budget-123'
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.delete.mockResolvedValue(undefined);

      const result = await useCaseWithoutEventBus.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.delete).toHaveBeenCalledWith('budget-123');
    });
  });
});
