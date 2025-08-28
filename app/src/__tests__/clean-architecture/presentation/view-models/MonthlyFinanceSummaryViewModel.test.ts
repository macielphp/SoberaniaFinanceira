import { MonthlyFinanceSummaryViewModel } from '../../../../clean-architecture/presentation/view-models/MonthlyFinanceSummaryViewModel';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { GetMonthlyFinanceSummaryUseCase } from '../../../../clean-architecture/domain/use-cases/GetMonthlyFinanceSummaryUseCase';

// Mock Use Case
const mockGetMonthlyFinanceSummaryUseCase = {
  execute: jest.fn(),
};

describe('MonthlyFinanceSummaryViewModel', () => {
  let monthlyFinanceSummaryViewModel: MonthlyFinanceSummaryViewModel;
  let mockMonthlyFinanceSummaries: MonthlyFinanceSummary[];

  beforeEach(() => {
    jest.clearAllMocks();

    monthlyFinanceSummaryViewModel = new MonthlyFinanceSummaryViewModel(
      mockGetMonthlyFinanceSummaryUseCase as any
    );

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

  describe('getMonthlyFinanceSummaries', () => {
    it('should get all monthly finance summaries when no filters provided', async () => {
      const response = { monthlyFinanceSummaries: mockMonthlyFinanceSummaries };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaries({});

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should get monthly finance summaries by user ID', async () => {
      const userId = 'user-456';
      const response = { monthlyFinanceSummaries: mockMonthlyFinanceSummaries };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaries({ userId });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ userId });
    });

    it('should get monthly finance summaries by month', async () => {
      const month = '2024-01';
      const response = { monthlyFinanceSummaries: [mockMonthlyFinanceSummaries[0]] };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaries({ month });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ month });
    });

    it('should get monthly finance summary by user and month', async () => {
      const userId = 'user-456';
      const month = '2024-01';
      const response = { monthlyFinanceSummaries: [mockMonthlyFinanceSummaries[0]] };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaries({ userId, month });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ userId, month });
    });

    it('should handle get failure', async () => {
      const error = new Error('Database connection failed');
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaries({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Database connection failed');
    });
  });

  describe('getMonthlyFinanceSummariesByUser', () => {
    it('should get monthly finance summaries by user ID', async () => {
      const userId = 'user-456';
      const response = { monthlyFinanceSummaries: mockMonthlyFinanceSummaries };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummariesByUser(userId);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ userId });
    });

    it('should handle empty user ID', async () => {
      const userId = '';
      const error = new Error('User ID cannot be empty');
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummariesByUser(userId);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('User ID cannot be empty');
    });
  });

  describe('getMonthlyFinanceSummariesByMonth', () => {
    it('should get monthly finance summaries by month', async () => {
      const month = '2024-01';
      const response = { monthlyFinanceSummaries: [mockMonthlyFinanceSummaries[0]] };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummariesByMonth(month);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ month });
    });

    it('should handle invalid month format', async () => {
      const month = '2024-13';
      const error = new Error('Month must be between 01 and 12');
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummariesByMonth(month);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Month must be between 01 and 12');
    });
  });

  describe('getMonthlyFinanceSummaryByUserAndMonth', () => {
    it('should get monthly finance summary by user and month', async () => {
      const userId = 'user-456';
      const month = '2024-01';
      const response = { monthlyFinanceSummaries: [mockMonthlyFinanceSummaries[0]] };
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => response
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth(userId, month);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow()).toEqual(response);
      expect(mockGetMonthlyFinanceSummaryUseCase.execute).toHaveBeenCalledWith({ userId, month });
    });

    it('should handle empty user ID', async () => {
      const userId = '';
      const month = '2024-01';
      const error = new Error('User ID cannot be empty');
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth(userId, month);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('User ID cannot be empty');
    });

    it('should handle invalid month format', async () => {
      const userId = 'user-456';
      const month = '2024-13';
      const error = new Error('Month must be between 01 and 12');
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => { throw error; }
      });

      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth(userId, month);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Month must be between 01 and 12');
    });
  });
});
