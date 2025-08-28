import { GetBudgetByIdUseCase } from '../../../../clean-architecture/domain/use-cases/GetBudgetByIdUseCase';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

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

describe('GetBudgetByIdUseCase', () => {
  let getBudgetByIdUseCase: GetBudgetByIdUseCase;
  let mockBudget: Budget;

  beforeEach(() => {
    jest.clearAllMocks();
    
    getBudgetByIdUseCase = new GetBudgetByIdUseCase(mockBudgetRepository);
    
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
    it('should get budget by ID successfully', async () => {
      const budgetId = 'budget-123';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);

      const result = await getBudgetByIdUseCase.execute({ budgetId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockBudget);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
    });

    it('should handle empty budget ID', async () => {
      const result = await getBudgetByIdUseCase.execute({ budgetId: '' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle null budget ID', async () => {
      const result = await getBudgetByIdUseCase.execute({ budgetId: null as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle undefined budget ID', async () => {
      const result = await getBudgetByIdUseCase.execute({ budgetId: undefined as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle budget not found', async () => {
      const budgetId = 'budget-999';
      mockBudgetRepository.findById.mockResolvedValue(null);

      const result = await getBudgetByIdUseCase.execute({ budgetId });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget not found');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
    });

    it('should handle repository error', async () => {
      const budgetId = 'budget-123';
      const errorMessage = 'Database connection failed';
      mockBudgetRepository.findById.mockRejectedValue(new Error(errorMessage));

      const result = await getBudgetByIdUseCase.execute({ budgetId });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get budget');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith(budgetId);
    });

    it('should handle whitespace budget ID', async () => {
      const result = await getBudgetByIdUseCase.execute({ budgetId: '   ' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
    });
  });
});
