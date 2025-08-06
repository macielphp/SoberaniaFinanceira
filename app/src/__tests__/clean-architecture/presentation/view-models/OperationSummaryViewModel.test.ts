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

    // Criar datas de forma explícita para evitar problemas de timezone
    const createDate = (year: number, month: number, day: number) => {
      return new Date(year, month - 1, day); // month - 1 porque getMonth() retorna 0-11
    };

    operations = [
      new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de débito',
        sourceAccount: mockAccount.id,
        destinationAccount: 'external',
        date: createDate(2024, 1, 1), // 2024-01-01
        value: new Money(100, 'BRL'),
        category: mockCategory.id,
        details: 'Supermercado',
        createdAt: createDate(2024, 1, 1)
      }),
      new Operation({
        id: 'op-2',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de débito',
        sourceAccount: mockAccount.id,
        destinationAccount: 'external',
        date: createDate(2024, 1, 2), // 2024-01-02
        value: new Money(50, 'BRL'),
        category: mockCategory.id,
        details: 'Restaurante',
        createdAt: createDate(2024, 1, 2)
      }),
      new Operation({
        id: 'op-3',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Transferência bancária',
        sourceAccount: 'external',
        destinationAccount: mockAccount.id,
        date: createDate(2024, 1, 5), // 2024-01-05
        value: new Money(3000, 'BRL'),
        category: 'cat-2',
        details: 'Salário',
        createdAt: createDate(2024, 1, 5)
      })
    ];

    const categories = [
      mockCategory,
      new Category({ id: 'cat-2', name: 'Salário', type: 'income', createdAt: new Date() })
    ];
    viewModel = new OperationSummaryViewModel(operations, categories);
  });

  // Teste de debug para verificar os filtros
  describe('Debug', () => {
    it('should debug filter issues', () => {
      const testDate = new Date(2024, 0, 1); // 2024-01-01 (month é 0-based)
      
      // Verificar operações filtradas
      const receitasFiltradas = operations.filter(op => 
        op.nature === 'receita' && 
        op.state === 'recebido' && 
        op.date.getFullYear() === testDate.getFullYear() &&
        op.date.getMonth() === testDate.getMonth()
      );
      
      const despesasFiltradas = operations.filter(op => 
        op.nature === 'despesa' && 
        op.state === 'pago' && 
        op.date.getFullYear() === testDate.getFullYear() &&
        op.date.getMonth() === testDate.getMonth()
      );
      
      console.log('Test Date:', testDate);
      console.log('Receitas filtradas:', receitasFiltradas.length);
      console.log('Despesas filtradas:', despesasFiltradas.length);
      
      // Verificar se o método isSameMonth está funcionando
      const op1 = operations[0]; // 2024-01-01
      const op2 = operations[1]; // 2024-01-02
      const op3 = operations[2]; // 2024-01-05
      
      console.log('Op1 date:', op1.date);
      console.log('Op2 date:', op2.date);
      console.log('Op3 date:', op3.date);
      
      // Testar isSameMonth manualmente
      const isSameMonth = (date1: Date, date2: Date): boolean => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth()
        );
      };
      
      console.log('Op1 same month as testDate:', isSameMonth(op1.date, testDate));
      console.log('Op2 same month as testDate:', isSameMonth(op2.date, testDate));
      console.log('Op3 same month as testDate:', isSameMonth(op3.date, testDate));
      
      expect(receitasFiltradas).toHaveLength(1); // Deve ter 1 receita em janeiro
      expect(despesasFiltradas).toHaveLength(2); // Deve ter 2 despesas em janeiro
    });

    it('should debug each operation individually', () => {
      const testDate = new Date(2024, 0, 1); // 2024-01-01
      
      operations.forEach((op, index) => {
        console.log(`Op${index + 1}:`);
        console.log('  Nature:', op.nature);
        console.log('  State:', op.state);
        console.log('  Date:', op.date);
        console.log('  Value:', op.value.value);
        
        const isReceita = op.nature === 'receita' && op.state === 'recebido';
        const isDespesa = op.nature === 'despesa' && op.state === 'pago';
        const isSameMonth = op.date.getFullYear() === testDate.getFullYear() && 
                           op.date.getMonth() === testDate.getMonth();
        
        console.log('  Is Receita:', isReceita);
        console.log('  Is Despesa:', isDespesa);
        console.log('  Is Same Month:', isSameMonth);
        console.log('  Should be included:', (isReceita || isDespesa) && isSameMonth);
        console.log('---');
      });
    });

    it('should test isSameMonth function directly', () => {
      const testDate = new Date(2024, 0, 1); // 2024-01-01
      const op1 = new Date(2024, 0, 1); // 2024-01-01
      const op2 = new Date(2024, 0, 2); // 2024-01-02
      const op3 = new Date(2024, 0, 5); // 2024-01-05
      
      const isSameMonth = (date1: Date, date2: Date): boolean => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth()
        );
      };
      
      console.log('Test Date:', testDate);
      console.log('Op1 (2024-01-01):', isSameMonth(op1, testDate));
      console.log('Op2 (2024-01-02):', isSameMonth(op2, testDate));
      console.log('Op3 (2024-01-05):', isSameMonth(op3, testDate));
      
      expect(isSameMonth(op1, testDate)).toBe(true);
      expect(isSameMonth(op2, testDate)).toBe(true);
      expect(isSameMonth(op3, testDate)).toBe(true);
    });

    it('should test timezone issues', () => {
      const testDate = new Date(2024, 0, 1); // 2024-01-01
      
      console.log('Test Date UTC:', testDate.toISOString());
      console.log('Test Date Local:', testDate.toString());
      console.log('Test Date Year:', testDate.getFullYear());
      console.log('Test Date Month:', testDate.getMonth());
      
      operations.forEach((op, index) => {
        console.log(`Op${index + 1} UTC:`, op.date.toISOString());
        console.log(`Op${index + 1} Local:`, op.date.toString());
        console.log(`Op${index + 1} Year:`, op.date.getFullYear());
        console.log(`Op${index + 1} Month:`, op.date.getMonth());
        console.log('---');
      });
    });
  });

  describe('Monthly Summary', () => {
    it('should calculate total income for January 2024', () => {
      const total = viewModel.getTotalIncomeForMonth(new Date(2024, 0, 1)); // 2024-01-01
      expect(total.value).toBe(3000); // Receita em 2024-01-05
    });

    it('should calculate total expenses for January 2024', () => {
      const total = viewModel.getTotalExpensesForMonth(new Date(2024, 0, 1)); // 2024-01-01
      expect(total.value).toBe(150); // 100 + 50 (ambas em janeiro)
    });

    it('should calculate net balance for January 2024', () => {
      const balance = viewModel.getNetBalanceForMonth(new Date(2024, 0, 1)); // 2024-01-01
      expect(balance.value).toBe(2850); // 3000 - 150
    });

    it('should calculate total expenses for January 2024 (both expenses)', () => {
      const total = viewModel.getTotalExpensesForMonth(new Date(2024, 0, 1)); // 2024-01-01
      // Ambas as despesas estão em janeiro (2024-01-01 e 2024-01-02)
      expect(total.value).toBe(150); // 100 + 50
    });

    it('should return zero totals for a month without operations', () => {
      const date = new Date(2023, 11, 1); // 2023-12-01
      expect(viewModel.getTotalIncomeForMonth(date).value).toBe(0);
      expect(viewModel.getTotalExpensesForMonth(date).value).toBe(0);
      expect(viewModel.getNetBalanceForMonth(date).value).toBe(0);
    });
  });

  describe('Category Grouping', () => {
    it('should group expenses by category for January 2024', () => {
      const groupedExpenses = viewModel.getExpensesByCategory(new Date(2024, 0, 1)); // 2024-01-01
      expect(groupedExpenses).toHaveLength(1);
      expect(groupedExpenses[0].category.id).toBe('cat-1');
      expect(groupedExpenses[0].total.value).toBe(150); // 100 + 50
    });

    it('should group income by category for January 2024', () => {
      const groupedIncome = viewModel.getIncomeByCategory(new Date(2024, 0, 1)); // 2024-01-01
      expect(groupedIncome).toHaveLength(1);
      expect(groupedIncome[0].category.name).toBe('Salário');
      expect(groupedIncome[0].total.value).toBe(3000);
    });

    it('should return empty array when no operations for category', () => {
      const date = new Date(2023, 11, 1); // 2023-12-01
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
    it('should calculate totals for date range (2024-01-01 to 2024-01-03)', () => {
      const startDate = new Date(2024, 0, 1); // 2024-01-01
      const endDate = new Date(2024, 0, 3); // 2024-01-03
      const summary = viewModel.getPeriodSummary(startDate, endDate);
      
      expect(summary.totalIncome.value).toBe(0); // Receita está em 2024-01-05
      expect(summary.totalExpenses.value).toBe(150); // 100 + 50 (ambas no período)
      expect(summary.netBalance.value).toBe(0); // 0 - 150 = 0 (não permite negativo)
    });

    it('should calculate totals for date range including income (2024-01-01 to 2024-01-05)', () => {
      const startDate = new Date(2024, 0, 1); // 2024-01-01
      const endDate = new Date(2024, 0, 5); // 2024-01-05
      const summary = viewModel.getPeriodSummary(startDate, endDate);
      
      expect(summary.totalIncome.value).toBe(3000); // Receita em 2024-01-05
      expect(summary.totalExpenses.value).toBe(150); // 100 + 50
      expect(summary.netBalance.value).toBe(2850); // 3000 - 150
    });

    it('should handle empty date range', () => {
      const startDate = new Date(2023, 11, 1); // 2023-12-01
      const endDate = new Date(2023, 11, 31); // 2023-12-31
      const summary = viewModel.getPeriodSummary(startDate, endDate);
      
      expect(summary.totalIncome.value).toBe(0);
      expect(summary.totalExpenses.value).toBe(0);
      expect(summary.netBalance.value).toBe(0);
    });
  });
});
