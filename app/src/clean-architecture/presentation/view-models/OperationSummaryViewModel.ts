import { IOperationRepository } from '../../domain/repositories/IOperationRepository';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Operation } from '../../domain/entities/Operation';
import { Category } from '../../domain/entities/Category';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingOperations: number;
  pendingIncome: number;
  pendingExpenses: number;
  liquidBalance: number;
}

export class OperationSummaryViewModel {
  public operations: Operation[] = [];
  public categories: Category[] = [];
  public loading: boolean = false;
  public error: string | null = null;
  public selectedPeriod: string = 'all';
  public includeVariableIncome: boolean = false;
  private operationRepository: IOperationRepository;
  private categoryRepository: ICategoryRepository;

  constructor(operationRepository: IOperationRepository, categoryRepository: ICategoryRepository) {
    this.operationRepository = operationRepository;
    this.categoryRepository = categoryRepository;
  }

  async loadOperations(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.operations = await this.operationRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar operações';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.categoryRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar categorias';
      throw error;
    }
  }

  getSummary(): FinancialSummary {
    const operations = this.operations;
    const totalIncome = operations
      .filter(op => op.nature === 'receita')
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);
    
    const totalExpenses = operations
      .filter(op => op.nature === 'despesa')
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);

    const pendingOperations = operations.filter(op => op.isPending()).length;
    const pendingIncome = operations
      .filter(op => op.nature === 'receita' && op.isPending())
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);
    const pendingExpenses = operations
      .filter(op => op.nature === 'despesa' && op.isPending())
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingOperations,
      pendingIncome,
      pendingExpenses,
      liquidBalance: (totalIncome - pendingIncome) - (totalExpenses - pendingExpenses),
    };
  }

  getFilteredOperations(): Operation[] {
    return this.operations;
  }

  getPeriodSummary(): FinancialSummary {
    return this.getSummary();
  }

  getTotalIncomeForMonth(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.operations
      .filter(op => {
        const opDate = new Date(op.date);
        return op.nature === 'receita' && opDate >= monthStart && opDate <= monthEnd;
      })
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);
  }

  getTotalExpensesForMonth(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.operations
      .filter(op => {
        const opDate = new Date(op.date);
        return op.nature === 'despesa' && opDate >= monthStart && opDate <= monthEnd;
      })
      .reduce((sum, op) => sum + (op.value?.value || 0), 0);
  }

  getNetBalanceForMonth(): number {
    return this.getTotalIncomeForMonth() - this.getTotalExpensesForMonth();
  }

  getIncomeByCategory(): Record<string, number> {
    const incomeByCategory: Record<string, number> = {};
    
    this.operations
      .filter(op => op.nature === 'receita')
      .forEach(op => {
        const category = op.category || 'Sem categoria';
        incomeByCategory[category] = (incomeByCategory[category] || 0) + (op.value?.value || 0);
      });

    return incomeByCategory;
  }

  getExpensesByCategory(): Record<string, number> {
    const expensesByCategory: Record<string, number> = {};
    
    this.operations
      .filter(op => op.nature === 'despesa')
      .forEach(op => {
        const category = op.category || 'Sem categoria';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (op.value?.value || 0);
      });

    return expensesByCategory;
  }

  getAccountSummary(): Record<string, number> {
    const accountSummary: Record<string, number> = {};
    
    this.operations.forEach(op => {
      const account = op.sourceAccount || 'Conta não especificada';
      const value = op.nature === 'receita' ? (op.value?.value || 0) : -(op.value?.value || 0);
      accountSummary[account] = (accountSummary[account] || 0) + value;
    });

    return accountSummary;
  }

  setSelectedPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  setIncludeVariableIncome(include: boolean): void {
    this.includeVariableIncome = include;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
