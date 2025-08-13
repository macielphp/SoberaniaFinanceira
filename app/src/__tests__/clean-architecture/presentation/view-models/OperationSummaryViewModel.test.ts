import { OperationSummaryViewModel } from '../../../../clean-architecture/presentation/view-models/OperationSummaryViewModel';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('OperationSummaryViewModel', () => {
  let viewModel: OperationSummaryViewModel;
  let operations: Operation[];
  let mockAccount: Account;
  let mockCategory: Category;

  beforeEach(() => {
    mockAccount = new Account({
      id: 'acc-1',
      name: 'Conta Principal',
      type: 'corrente',
      balance: new Money(1000, 'BRL'),
      isActive: true,
      createdAt: new Date()
    });

    mockCategory = new Category({
      id: 'cat-1',
      name: 'Alimentação',
      type: 'expense',
      createdAt: new Date()
    });

    operations = [
      new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de débito',
        sourceAccount: mockAccount.id,
        destinationAccount: 'external',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: mockCategory.id,
        details: 'Supermercado',
        createdAt: new Date('2024-01-01')
      }),
      new Operation({
        id: 'op-2',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de débito',
        sourceAccount: mockAccount.id,
        destinationAccount: 'external',
        date: new Date('2024-01-02'),
        value: new Money(50, 'BRL'),
        category: mockCategory.id,
        details: 'Restaurante',
        createdAt: new Date('2024-01-02')
      }),
      new Operation({
        id: 'op-3',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Transferência bancária',
        sourceAccount: 'external',
        destinationAccount: mockAccount.id,
        date: new Date('2024-01-05'),
        value: new Money(3000, 'BRL'),
        category: 'cat-2',
        details: 'Salário',
        createdAt: new Date('2024-01-05')
      })
    ];

    const categories = [
      mockCategory,
      new Category({ id: 'cat-2', name: 'Salário', type: 'income', createdAt: new Date() })
    ];
    viewModel = new OperationSummaryViewModel(operations, categories);
  });

  describe('Monthly Summary', () => {
    it('should calculate total income for a month', () => {
      const total = viewModel.getTotalIncomeForMonth(new Date('2024-01-01'));
      expect(total.value).toBe(3000);
    });

    it('should calculate total expenses for a month', () => {
      const total = viewModel.getTotalExpensesForMonth(new Date('2024-01-01'));
      expect(total.value).toBe(150);
    });

    it('should calculate net balance for a month', () => {
      const balance = viewModel.getNetBalanceForMonth(new Date('2024-01-01'));
      expect(balance.value).toBe(2850); // 3000 - 150
    });

    it('should return zero totals for a month without operations', () => {
      const date = new Date('2023-12-01');
      expect(viewModel.getTotalIncomeForMonth(date).value).toBe(0);
      expect(viewModel.getTotalExpensesForMonth(date).value).toBe(0);
      expect(viewModel.getNetBalanceForMonth(date).value).toBe(0);
    });
  });

  describe('Category Grouping', () => {
    it('should group expenses by category', () => {
      const groupedExpenses = viewModel.getExpensesByCategory(new Date('2024-01-01'));
      expect(groupedExpenses).toHaveLength(1);
      expect(groupedExpenses[0].category.id).toBe('cat-1');
      expect(groupedExpenses[0].total.value).toBe(150);
    });

    it('should group income by category', () => {
      const groupedIncome = viewModel.getIncomeByCategory(new Date('2024-01-01'));
      expect(groupedIncome).toHaveLength(1);
      const income = viewModel.getIncomeByCategory(new Date('2024-01-01'));
      expect(income[0].category.name).toBe('Salário');
      expect(groupedIncome[0].total.value).toBe(3000);
    });

    it('should return empty array when no operations for category', () => {
      const date = new Date('2023-12-01');
      expect(viewModel.getExpensesByCategory(date)).toHaveLength(0);
      expect(viewModel.getIncomeByCategory(date)).toHaveLength(0);
    });
  });

  describe('Account Analysis', () => {
    it('should calculate total operations by account', () => {
      const accountSummary = viewModel.getAccountSummary(mockAccount.id);
      expect(accountSummary.totalIncome.value).toBe(3000);
      expect(accountSummary.totalExpenses.value).toBe(150);
      expect(accountSummary.netBalance.value).toBe(2850);
    });

    it('should return zero totals for non-existent account', () => {
      const summary = viewModel.getAccountSummary('non-existent-id');
      expect(summary.totalIncome.value).toBe(0);
      expect(summary.totalExpenses.value).toBe(0);
      expect(summary.netBalance.value).toBe(0);
    });
  });

  describe('Period Analysis', () => {
    it('should calculate totals for date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      const summary = viewModel.getPeriodSummary(startDate, endDate);
      
      expect(summary.totalIncome.value).toBe(0); // No income in this period
      expect(summary.totalExpenses.value).toBe(150); // Both expenses
      expect(summary.netBalance.value).toBe(-150);
    });

    it('should handle empty date range', () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-31');
      const summary = viewModel.getPeriodSummary(startDate, endDate);
      
      expect(summary.totalIncome.value).toBe(0);
      expect(summary.totalExpenses.value).toBe(0);
      expect(summary.netBalance.value).toBe(0);
    });
  });
});
