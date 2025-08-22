// Tests for SQLiteMonthlyFinanceSummaryRepository
// Following TDD and Clean Architecture patterns

import { SQLiteMonthlyFinanceSummaryRepository } from '../../../../clean-architecture/data/repositories/SQLiteMonthlyFinanceSummaryRepository';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock SQLite database
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  close: jest.fn()
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDatabase)
}));

describe('SQLiteMonthlyFinanceSummaryRepository', () => {
  let repository: SQLiteMonthlyFinanceSummaryRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteMonthlyFinanceSummaryRepository();
  });

  describe('save', () => {
    it('should save a new monthly finance summary', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]); // findById returns empty (new summary)
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3200, 'BRL')
      });

      const result = await repository.save(summary);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO monthly_finance_summaries'),
        [
          'summary-123',
          'user-456',
          '2024-01',
          5000,
          3000,
          2000,
          4000,
          3200,
          expect.any(String)
        ]
      );
      expect(result).toEqual(summary);
    });

    it('should update an existing monthly finance summary', async () => {
      const mockSummaryData = {
        id: 'summary-123',
        user_id: 'user-456',
        month: '2024-01',
        total_income: 5000,
        total_expense: 3000,
        balance: 2000,
        total_planned_budget: 4000,
        total_actual_budget: 3200,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValueOnce([mockSummaryData]); // findById returns existing
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const updatedSummary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(6000, 'BRL'),
        totalExpense: new Money(3500, 'BRL'),
        balance: new Money(2500, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3500, 'BRL')
      });

      const result = await repository.save(updatedSummary);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE monthly_finance_summaries'),
        [
          'user-456',
          '2024-01',
          6000,
          3500,
          2500,
          4000,
          3500,
          'summary-123'
        ]
      );
      expect(result).toEqual(updatedSummary);
    });
  });

  describe('findById', () => {
    it('should find monthly finance summary by id', async () => {
      const mockSummaryData = {
        id: 'summary-123',
        user_id: 'user-456',
        month: '2024-01',
        total_income: 5000,
        total_expense: 3000,
        balance: 2000,
        total_planned_budget: 4000,
        total_actual_budget: 3200,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValue([mockSummaryData]);

      const result = await repository.findById('summary-123');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM monthly_finance_summaries WHERE id = ?'),
        ['summary-123']
      );
      expect(result).toBeInstanceOf(MonthlyFinanceSummary);
      expect(result?.id).toBe('summary-123');
      expect(result?.month).toBe('2024-01');
    });

    it('should return null for non-existent monthly finance summary', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all monthly finance summaries', async () => {
      const mockSummariesData = [
        {
          id: 'summary-1',
          user_id: 'user-456',
          month: '2024-01',
          total_income: 5000,
          total_expense: 3000,
          balance: 2000,
          total_planned_budget: 4000,
          total_actual_budget: 3200,
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'summary-2',
          user_id: 'user-456',
          month: '2024-02',
          total_income: 5500,
          total_expense: 2800,
          balance: 2700,
          total_planned_budget: 4000,
          total_actual_budget: 2800,
          created_at: '2024-02-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockSummariesData);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM monthly_finance_summaries ORDER BY month DESC')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MonthlyFinanceSummary);
      expect(result[1]).toBeInstanceOf(MonthlyFinanceSummary);
      expect(result[0].id).toBe('summary-1');
      expect(result[1].id).toBe('summary-2');
    });

    it('should return empty array when no monthly finance summaries exist', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByUser', () => {
    it('should find monthly finance summaries by user id', async () => {
      const mockSummariesData = [
        {
          id: 'summary-1',
          user_id: 'user-456',
          month: '2024-01',
          total_income: 5000,
          total_expense: 3000,
          balance: 2000,
          total_planned_budget: 4000,
          total_actual_budget: 3200,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockSummariesData);

      const result = await repository.findByUser('user-456');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM monthly_finance_summaries WHERE user_id = ?'),
        ['user-456']
      );
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
    });
  });

  describe('findByMonth', () => {
    it('should find monthly finance summary by month', async () => {
      const mockSummaryData = [
        {
          id: 'summary-1',
          user_id: 'user-456',
          month: '2024-01',
          total_income: 5000,
          total_expense: 3000,
          balance: 2000,
          total_planned_budget: 4000,
          total_actual_budget: 3200,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockSummaryData);

      const result = await repository.findByMonth('2024-01');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM monthly_finance_summaries WHERE month = ?'),
        ['2024-01']
      );
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('2024-01');
    });
  });

  describe('findByUserAndMonth', () => {
    it('should find monthly finance summary by user id and month', async () => {
      const mockSummaryData = [
        {
          id: 'summary-1',
          user_id: 'user-456',
          month: '2024-01',
          total_income: 5000,
          total_expense: 3000,
          balance: 2000,
          total_planned_budget: 4000,
          total_actual_budget: 3200,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockSummaryData);

      const result = await repository.findByUserAndMonth('user-456', '2024-01');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM monthly_finance_summaries WHERE user_id = ? AND month = ?'),
        ['user-456', '2024-01']
      );
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
      expect(result[0].month).toBe('2024-01');
    });
  });

  describe('delete', () => {
    it('should delete monthly finance summary by id', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('summary-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM monthly_finance_summaries WHERE id = ?'),
        ['summary-123']
      );
      expect(result).toBe(true);
    });

    it('should return false when monthly finance summary does not exist', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count total monthly finance summaries', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([{ count: 3 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM monthly_finance_summaries')
      );
      expect(result).toBe(3);
    });
  });
});
