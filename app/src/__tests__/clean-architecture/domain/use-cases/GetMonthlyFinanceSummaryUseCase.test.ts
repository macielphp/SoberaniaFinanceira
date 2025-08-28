import { GetMonthlyFinanceSummaryUseCase } from '../../../../clean-architecture/domain/use-cases/GetMonthlyFinanceSummaryUseCase';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository
const mockMonthlyFinanceSummaryRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUser: jest.fn(),
  findByMonth: jest.fn(),
  findByUserAndMonth: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn(),
};

describe('GetMonthlyFinanceSummaryUseCase', () => {
  let getMonthlyFinanceSummaryUseCase: GetMonthlyFinanceSummaryUseCase;
  let mockMonthlyFinanceSummaries: MonthlyFinanceSummary[];

  beforeEach(() => {
    jest.clearAllMocks();
    
    getMonthlyFinanceSummaryUseCase = new GetMonthlyFinanceSummaryUseCase(mockMonthlyFinanceSummaryRepository);
    
    mockMonthlyFinanceSummaries = [
      new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(5000, 'BRL')
      }),
      new MonthlyFinanceSummary({
        id: 'summary-124',
        userId: 'user-456',
        month: '2024-02',
        totalIncome: new Money(8500, 'BRL'),
        totalExpense: new Money(4800, 'BRL'),
        balance: new Money(3700, 'BRL'),
        totalPlannedBudget: new Money(6500, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      })
    ];
  });

  describe('execute', () => {
    it('should get all monthly finance summaries when no filters are provided', async () => {
      mockMonthlyFinanceSummaryRepository.findAll.mockResolvedValue(mockMonthlyFinanceSummaries);

      const result = await getMonthlyFinanceSummaryUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().monthlyFinanceSummaries).toEqual(mockMonthlyFinanceSummaries);
      expect(mockMonthlyFinanceSummaryRepository.findAll).toHaveBeenCalled();
    });

    it('should get monthly finance summaries by user ID', async () => {
      const userId = 'user-456';
      mockMonthlyFinanceSummaryRepository.findByUser.mockResolvedValue(mockMonthlyFinanceSummaries);

      const result = await getMonthlyFinanceSummaryUseCase.execute({ userId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().monthlyFinanceSummaries).toEqual(mockMonthlyFinanceSummaries);
      expect(mockMonthlyFinanceSummaryRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should get monthly finance summaries by month', async () => {
      const month = '2024-01';
      mockMonthlyFinanceSummaryRepository.findByMonth.mockResolvedValue([mockMonthlyFinanceSummaries[0]]);

      const result = await getMonthlyFinanceSummaryUseCase.execute({ month });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().monthlyFinanceSummaries).toEqual([mockMonthlyFinanceSummaries[0]]);
      expect(mockMonthlyFinanceSummaryRepository.findByMonth).toHaveBeenCalledWith(month);
    });

    it('should get monthly finance summary by user and month', async () => {
      const userId = 'user-456';
      const month = '2024-01';
      mockMonthlyFinanceSummaryRepository.findByUserAndMonth.mockResolvedValue([mockMonthlyFinanceSummaries[0]]);

      const result = await getMonthlyFinanceSummaryUseCase.execute({ userId, month });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().monthlyFinanceSummaries).toEqual([mockMonthlyFinanceSummaries[0]]);
      expect(mockMonthlyFinanceSummaryRepository.findByUserAndMonth).toHaveBeenCalledWith(userId, month);
    });

    it('should handle empty user ID gracefully', async () => {
      const userId = '';

      const result = await getMonthlyFinanceSummaryUseCase.execute({ userId });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('User ID cannot be empty');
      expect(mockMonthlyFinanceSummaryRepository.findByUser).not.toHaveBeenCalled();
    });

    it('should handle invalid month format', async () => {
      const month = '2024-13'; // Invalid month

      const result = await getMonthlyFinanceSummaryUseCase.execute({ month });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Month must be between 01 and 12');
      expect(mockMonthlyFinanceSummaryRepository.findByMonth).not.toHaveBeenCalled();
    });

    it('should handle invalid year', async () => {
      const month = '1899-01'; // Invalid year

      const result = await getMonthlyFinanceSummaryUseCase.execute({ month });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Year must be between 1900 and 2100');
      expect(mockMonthlyFinanceSummaryRepository.findByMonth).not.toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const errorMessage = 'Database connection failed';
      mockMonthlyFinanceSummaryRepository.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await getMonthlyFinanceSummaryUseCase.execute({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get monthly finance summaries');
    });

    it('should return empty array when no summaries found', async () => {
      mockMonthlyFinanceSummaryRepository.findAll.mockResolvedValue([]);

      const result = await getMonthlyFinanceSummaryUseCase.execute({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().monthlyFinanceSummaries).toEqual([]);
    });
  });
});
