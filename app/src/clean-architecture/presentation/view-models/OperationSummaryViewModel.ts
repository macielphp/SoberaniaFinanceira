import { Operation } from '../../../clean-architecture/domain/entities/Operation';
import { Category } from '../../../clean-architecture/domain/entities/Category';
import { Money } from '../../../clean-architecture/shared/utils/Money';

interface CategorySummary {
  category: Category;
  total: Money;
  count: number;
}

interface AccountSummary {
  totalIncome: Money;
  totalExpenses: Money;
  netBalance: Money;
}

interface PeriodSummary {
  totalIncome: Money;
  totalExpenses: Money;
  netBalance: Money;
  startDate: Date;
  endDate: Date;
}

export class OperationSummaryViewModel {
  private categoryCache: Map<string, Category> = new Map();

  constructor(
    private operations: Operation[],
    private categories: Category[]
  ) {
    this.initializeCategoryCache();
  }

  private initializeCategoryCache(): void {
    this.categories.forEach(category => {
      this.categoryCache.set(category.id, category);
    });
  }

  private getCategoryById(categoryId: string): Category {
    const category = this.categoryCache.get(categoryId);
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }
    return category;
  }

  private isSameMonth(date1: Date, date2: Date): boolean {
    // Normalizar as datas para evitar problemas de timezone
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), 1);
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), 1);
    return d1.getTime() === d2.getTime();
  }

  private isInDateRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  private createEmptyMoney(): Money {
    return new Money(0, 'BRL');
  }

  // Método para subtração que permite valores negativos
  private subtractMoney(a: Money, b: Money): Money {
    const result = a.value - b.value;
    return new Money(Math.abs(result), 'BRL');
  }

  getTotalIncomeForMonth(date: Date): Money {
    return this.operations
      .filter(op => 
        op.nature === 'receita' && 
        op.state === 'recebido' && 
        this.isSameMonth(op.date, date)
      )
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());
  }

  getTotalExpensesForMonth(date: Date): Money {
    return this.operations
      .filter(op => 
        op.nature === 'despesa' && 
        op.state === 'pago' && 
        this.isSameMonth(op.date, date)
      )
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());
  }

  getNetBalanceForMonth(date: Date): Money {
    const income = this.getTotalIncomeForMonth(date);
    const expenses = this.getTotalExpensesForMonth(date);
    
    if (income.value >= expenses.value) {
      return income.subtract(expenses);
    } else {
      // Se despesas > receitas, retorna zero (não permite saldo negativo)
      return this.createEmptyMoney();
    }
  }

  getExpensesByCategory(date: Date): CategorySummary[] {
    const categoryMap = new Map<string, CategorySummary>();

    this.operations
      .filter(op => 
        op.nature === 'despesa' && 
        op.state === 'pago' && 
        this.isSameMonth(op.date, date)
      )
      .forEach(op => {
        const categoryId = op.category;
        const existing = categoryMap.get(categoryId);

        if (existing) {
          existing.total = existing.total.add(op.value);
          existing.count += 1;
        } else {
          categoryMap.set(categoryId, {
            category: this.getCategoryById(categoryId),
            total: op.value,
            count: 1
          });
        }
      });

    return Array.from(categoryMap.values());
  }

  getIncomeByCategory(date: Date): CategorySummary[] {
    const categoryMap = new Map<string, CategorySummary>();

    this.operations
      .filter(op => 
        op.nature === 'receita' && 
        op.state === 'recebido' && 
        this.isSameMonth(op.date, date)
      )
      .forEach(op => {
        const categoryId = op.category;
        const existing = categoryMap.get(categoryId);

        if (existing) {
          existing.total = existing.total.add(op.value);
          existing.count += 1;
        } else {
          categoryMap.set(categoryId, {
            category: this.getCategoryById(categoryId),
            total: op.value,
            count: 1
          });
        }
      });

    return Array.from(categoryMap.values());
  }

  getAccountSummary(accountId: string): AccountSummary {
    const accountOperations = this.operations.filter(
      op => op.sourceAccount === accountId || op.destinationAccount === accountId
    );

    const totalIncome = accountOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());

    const totalExpenses = accountOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());

    let netBalance: Money;
    if (totalIncome.value >= totalExpenses.value) {
      netBalance = totalIncome.subtract(totalExpenses);
    } else {
      netBalance = this.createEmptyMoney();
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance
    };
  }

  getPeriodSummary(startDate: Date, endDate: Date): PeriodSummary {
    const periodOperations = this.operations.filter(op =>
      this.isInDateRange(op.date, startDate, endDate)
    );

    const totalIncome = periodOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());

    const totalExpenses = periodOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total.add(op.value), this.createEmptyMoney());

    let netBalance: Money;
    if (totalIncome.value >= totalExpenses.value) {
      netBalance = totalIncome.subtract(totalExpenses);
    } else {
      netBalance = this.createEmptyMoney();
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      startDate,
      endDate
    };
  }
}
