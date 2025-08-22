// Tests for MonthlyFinanceSummary Entity
import { MonthlyFinanceSummary } from '../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('MonthlyFinanceSummary Entity', () => {
  describe('constructor', () => {
    it('should create monthly summary with valid data', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      expect(summary.id).toBe('summary-123');
      expect(summary.userId).toBe('user-456');
      expect(summary.month).toBe('2024-01');
      expect(summary.totalIncome).toEqual(new Money(8000, 'BRL'));
      expect(summary.totalExpense).toEqual(new Money(5000, 'BRL'));
      expect(summary.balance).toEqual(new Money(3000, 'BRL'));
      expect(summary.totalPlannedBudget).toEqual(new Money(6000, 'BRL'));
      expect(summary.totalActualBudget).toEqual(new Money(4800, 'BRL'));
    });

    it('should create monthly summary with minimal required data', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      expect(summary.id).toBe('summary-123');
      expect(summary.userId).toBe('user-456');
      expect(summary.month).toBe('2024-01');
      expect(summary.totalIncome).toEqual(new Money(5000, 'BRL'));
      expect(summary.totalExpense).toEqual(new Money(3000, 'BRL'));
      expect(summary.balance).toEqual(new Money(2000, 'BRL'));
    });
  });

  describe('validation', () => {
    it('should throw error for invalid month format', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '2024/01',
          totalIncome: new Money(5000, 'BRL'),
          totalExpense: new Money(3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(4000, 'BRL'),
          totalActualBudget: new Money(3000, 'BRL')
        });
      }).toThrow('Month must be in YYYY-MM format');
    });

    it('should throw error for empty month', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '',
          totalIncome: new Money(5000, 'BRL'),
          totalExpense: new Money(3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(4000, 'BRL'),
          totalActualBudget: new Money(3000, 'BRL')
        });
      }).toThrow('Month cannot be empty');
    });

    it('should throw error for negative income', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '2024-01',
          totalIncome: new Money(-1000, 'BRL'),
          totalExpense: new Money(3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(4000, 'BRL'),
          totalActualBudget: new Money(3000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });

    it('should throw error for negative expense', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '2024-01',
          totalIncome: new Money(5000, 'BRL'),
          totalExpense: new Money(-3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(4000, 'BRL'),
          totalActualBudget: new Money(3000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });

    it('should throw error for negative planned budget', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '2024-01',
          totalIncome: new Money(5000, 'BRL'),
          totalExpense: new Money(3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(-4000, 'BRL'),
          totalActualBudget: new Money(3000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });

    it('should throw error for negative actual budget', () => {
      expect(() => {
        new MonthlyFinanceSummary({
          id: 'summary-123',
          userId: 'user-456',
          month: '2024-01',
          totalIncome: new Money(5000, 'BRL'),
          totalExpense: new Money(3000, 'BRL'),
          balance: new Money(2000, 'BRL'),
          totalPlannedBudget: new Money(4000, 'BRL'),
          totalActualBudget: new Money(-3000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });
  });

  describe('business methods', () => {
    it('should calculate savings rate', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const savingsRate = summary.calculateSavingsRate();

      expect(savingsRate).toBe(37.5); // (3000 / 8000) * 100 = 37.5%
    });

    it('should return zero savings rate when no income', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(0, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(0, 'BRL'), // Balance cannot be negative with Money class
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const savingsRate = summary.calculateSavingsRate();

      expect(savingsRate).toBe(0);
    });

    it('should calculate budget adherence', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const adherence = summary.calculateBudgetAdherence();

      expect(adherence).toBe(80); // (4800 / 6000) * 100 = 80%
    });

    it('should return zero budget adherence when no planned budget', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(0, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const adherence = summary.calculateBudgetAdherence();

      expect(adherence).toBe(0);
    });

    it('should check if month is profitable', () => {
      const profitableSummary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const unprofitableSummary = new MonthlyFinanceSummary({
        id: 'summary-124',
        userId: 'user-456',
        month: '2024-02',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(8000, 'BRL'),
        balance: new Money(0, 'BRL'), // Balance cannot be negative with Money class
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      expect(profitableSummary.isProfitable()).toBe(true);
      expect(unprofitableSummary.isProfitable()).toBe(false);
    });

    it('should check if month is balanced', () => {
      const balancedSummary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(0, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      const unbalancedSummary = new MonthlyFinanceSummary({
        id: 'summary-124',
        userId: 'user-456',
        month: '2024-02',
        totalIncome: new Money(8000, 'BRL'),
        totalExpense: new Money(5000, 'BRL'),
        balance: new Money(3000, 'BRL'),
        totalPlannedBudget: new Money(6000, 'BRL'),
        totalActualBudget: new Money(4800, 'BRL')
      });

      expect(balancedSummary.isBalanced()).toBe(true);
      expect(unbalancedSummary.isBalanced()).toBe(false);
    });

    it('should update total income', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      const updatedSummary = summary.updateTotalIncome(new Money(7000, 'BRL'));

      expect(updatedSummary.totalIncome).toEqual(new Money(7000, 'BRL'));
      expect(updatedSummary.balance).toEqual(new Money(4000, 'BRL')); // 7000 - 3000
      expect(updatedSummary.id).toBe(summary.id);
    });

    it('should update total expense', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      const updatedSummary = summary.updateTotalExpense(new Money(4000, 'BRL'));

      expect(updatedSummary.totalExpense).toEqual(new Money(4000, 'BRL'));
      expect(updatedSummary.balance).toEqual(new Money(1000, 'BRL')); // 5000 - 4000
      expect(updatedSummary.id).toBe(summary.id);
    });

    it('should update budget values', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      const updatedSummary = summary.updateBudgetValues(
        new Money(5000, 'BRL'),
        new Money(4000, 'BRL')
      );

      expect(updatedSummary.totalPlannedBudget).toEqual(new Money(5000, 'BRL'));
      expect(updatedSummary.totalActualBudget).toEqual(new Money(4000, 'BRL'));
      expect(updatedSummary.id).toBe(summary.id);
    });

    it('should get month and year', () => {
      const summary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      const { month, year } = summary.getMonthAndYear();

      expect(month).toBe(1);
      expect(year).toBe(2024);
    });
  });

  describe('immutability', () => {
    it('should return new instance when updating values', () => {
      const originalSummary = new MonthlyFinanceSummary({
        id: 'summary-123',
        userId: 'user-456',
        month: '2024-01',
        totalIncome: new Money(5000, 'BRL'),
        totalExpense: new Money(3000, 'BRL'),
        balance: new Money(2000, 'BRL'),
        totalPlannedBudget: new Money(4000, 'BRL'),
        totalActualBudget: new Money(3000, 'BRL')
      });

      const updatedSummary = originalSummary.updateTotalIncome(new Money(7000, 'BRL'));

      expect(updatedSummary).not.toBe(originalSummary);
      expect(originalSummary.totalIncome).toEqual(new Money(5000, 'BRL'));
      expect(updatedSummary.totalIncome).toEqual(new Money(7000, 'BRL'));
    });
  });
});
