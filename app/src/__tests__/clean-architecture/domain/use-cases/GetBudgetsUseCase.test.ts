import { GetBudgetsUseCase } from '../../../../clean-architecture/domain/use-cases/GetBudgetsUseCase';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository
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

describe('GetBudgetsUseCase', () => {
  let getBudgetsUseCase: GetBudgetsUseCase;
  let mockBudgets: Budget[];

  beforeEach(() => {
    jest.clearAllMocks();
    
    getBudgetsUseCase = new GetBudgetsUseCase(mockBudgetRepository);
    
    mockBudgets = [
      new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Janeiro 2024',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(5000, 'BRL')
      }),
      new Budget({
        id: 'budget-124',
        userId: 'user-456',
        name: 'Orçamento Fevereiro 2024',
        startPeriod: new Date('2024-02-01'),
        endPeriod: new Date('2024-02-29'),
        type: 'manual',
        totalPlannedValue: new Money(6000, 'BRL')
      })
    ];
  });

  describe('execute', () => {
    it('should get all budgets when no filters are provided', async () => {
      mockBudgetRepository.findAll.mockResolvedValue(mockBudgets);

      const result = await getBudgetsUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgets).toEqual(mockBudgets);
      expect(mockBudgetRepository.findAll).toHaveBeenCalled();
    });

    it('should get budgets by user ID', async () => {
      const userId = 'user-456';
      mockBudgetRepository.findByUser.mockResolvedValue(mockBudgets);

      const result = await getBudgetsUseCase.execute({ userId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgets).toEqual(mockBudgets);
      expect(mockBudgetRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should get active budgets only', async () => {
      const activeOnly = true;
      mockBudgetRepository.findAll.mockResolvedValue(mockBudgets);

      const result = await getBudgetsUseCase.execute({ activeOnly });

      expect(result.isSuccess()).toBe(true);
      const returnedBudgets = result.getOrThrow().budgets;
      expect(returnedBudgets).toHaveLength(mockBudgets.length);
      expect(returnedBudgets[0].id).toBe(mockBudgets[0].id);
      expect(returnedBudgets[1].id).toBe(mockBudgets[1].id);
      expect(mockBudgetRepository.findAll).toHaveBeenCalled();
    });

    it('should get active budgets by user', async () => {
      const userId = 'user-456';
      const activeOnly = true;
      mockBudgetRepository.findActiveByUser.mockResolvedValue(mockBudgets);

      const result = await getBudgetsUseCase.execute({ userId, activeOnly });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgets).toEqual(mockBudgets);
      expect(mockBudgetRepository.findActiveByUser).toHaveBeenCalledWith(userId);
    });

    it('should get budgets by date range', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };
      mockBudgetRepository.findByDateRange.mockResolvedValue(mockBudgets);

      const result = await getBudgetsUseCase.execute({ dateRange });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgets).toEqual(mockBudgets);
      expect(mockBudgetRepository.findByDateRange).toHaveBeenCalledWith(dateRange.start, dateRange.end);
    });

    it('should handle repository error', async () => {
      const errorMessage = 'Database connection failed';
      mockBudgetRepository.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await getBudgetsUseCase.execute({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get budgets');
    });

    it('should return empty array when no budgets found', async () => {
      mockBudgetRepository.findAll.mockResolvedValue([]);

      const result = await getBudgetsUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budgets).toEqual([]);
    });
  });
});
