// ViewModel: BudgetPerformanceViewModel
// Gerencia o estado e lógica de apresentação para análise de performance de orçamentos
// Segue Clean Architecture - conecta UI aos Use Cases

import { Budget } from '../../domain/entities/Budget';
import { BudgetItem } from '../../domain/entities/BudgetItem';
import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { IBudgetItemRepository } from '../../domain/repositories/IBudgetItemRepository';
import { IMonthlyFinanceSummaryRepository } from '../../domain/repositories/IMonthlyFinanceSummaryRepository';
import { GetBudgetsUseCase } from '../../domain/use-cases/GetBudgetsUseCase';
import { GetBudgetItemsUseCase } from '../../domain/use-cases/GetBudgetItemsUseCase';
import { GetMonthlyFinanceSummaryUseCase } from '../../domain/use-cases/GetMonthlyFinanceSummaryUseCase';

export interface PerformanceData {
  month: string;
  planned: number;
  actual: number;
  percentage: number;
  variance: number;
}

export interface BudgetPerformanceAnalysis {
  budgetId: string;
  budgetName: string;
  totalPlanned: number;
  totalActual: number;
  overallPercentage: number;
  monthlyPerformance: PerformanceData[];
  averagePerformance: number;
  bestMonth: PerformanceData | null;
  worstMonth: PerformanceData | null;
  isOnTrack: boolean;
  recommendations: string[];
}

export interface CategoryPerformance {
  categoryName: string;
  categoryType: 'income' | 'expense';
  plannedValue: number;
  actualValue: number;
  percentage: number;
  variance: number;
  budgetItemCount: number;
}

export class BudgetPerformanceViewModel {
  public loading: boolean = false;
  public error: string | null = null;
  public performanceAnalysis: BudgetPerformanceAnalysis | null = null;
  public categoryPerformance: CategoryPerformance[] = [];

  private getBudgetsUseCase: GetBudgetsUseCase;
  private getBudgetItemsUseCase: GetBudgetItemsUseCase;
  private getMonthlyFinanceSummaryUseCase: GetMonthlyFinanceSummaryUseCase;

  constructor(
    budgetRepository: IBudgetRepository,
    budgetItemRepository: IBudgetItemRepository,
    monthlyFinanceSummaryRepository: IMonthlyFinanceSummaryRepository
  ) {
    this.getBudgetsUseCase = new GetBudgetsUseCase(budgetRepository);
    this.getBudgetItemsUseCase = new GetBudgetItemsUseCase(budgetItemRepository);
    this.getMonthlyFinanceSummaryUseCase = new GetMonthlyFinanceSummaryUseCase(monthlyFinanceSummaryRepository);
  }

  // Public methods
  async analyzeBudgetPerformance(budgetId: string, months: number = 6): Promise<BudgetPerformanceAnalysis> {
    this.loading = true;
    this.error = null;

    try {
      // Get budget information
      const budgetResult = await this.getBudgetsUseCase.execute({ userId: '' });
      if (!budgetResult.isSuccess()) {
        throw new Error('Failed to load budget information');
      }

      const budgets = budgetResult.getOrElse({ budgets: [] }).budgets;
      const budget = budgets.find(b => b.id === budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      // Get budget items for the budget
      const budgetItemsResult = await this.getBudgetItemsUseCase.execute({ budgetId });
      if (!budgetItemsResult.isSuccess()) {
        const error = budgetItemsResult.getOrThrow();
        throw error instanceof Error ? error : new Error('Failed to load budget items');
      }

      const budgetItems = budgetItemsResult.getOrElse({ budgetItems: [] }).budgetItems;

      // Get monthly finance summaries for the period
      const monthlyPerformance: PerformanceData[] = [];
      const currentDate = new Date();
      
      for (let i = 0; i < months; i++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthString = monthDate.toISOString().substring(0, 7); // YYYY-MM format

        try {
          const summaryResult = await this.getMonthlyFinanceSummaryUseCase.execute({
            userId: budget.userId,
            month: monthString
          });

          if (summaryResult.isSuccess()) {
            const summaries = summaryResult.getOrElse({ monthlyFinanceSummaries: [] }).monthlyFinanceSummaries;
            const summary = summaries[0]; // Get first summary for the month

            if (summary) {
              const planned = budget.totalPlannedValue.value;
              const actual = summary.totalActualBudget.value;
              const percentage = planned > 0 ? Math.round((actual / planned) * 100) : 0;
              const variance = actual - planned;

              monthlyPerformance.push({
                month: this.formatMonth(monthDate),
                planned,
                actual,
                percentage,
                variance
              });
            }
          }
        } catch (error) {
          // Skip months without data
          continue;
        }
      }

      // Calculate overall performance
      const totalPlanned = budget.totalPlannedValue.value;
      const totalActual = monthlyPerformance.reduce((sum, month) => sum + month.actual, 0);
      const overallPercentage = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

      // Calculate statistics
      const averagePerformance = monthlyPerformance.length > 0 
        ? Math.round(monthlyPerformance.reduce((sum, month) => sum + month.percentage, 0) / monthlyPerformance.length)
        : 0;

      const bestMonth = monthlyPerformance.length > 0 
        ? monthlyPerformance.reduce((best, current) => current.percentage > best.percentage ? current : best)
        : null;

      const worstMonth = monthlyPerformance.length > 0 
        ? monthlyPerformance.reduce((worst, current) => current.percentage < worst.percentage ? current : worst)
        : null;

      // Determine if on track
      const isOnTrack = overallPercentage <= 100 && averagePerformance >= 80;

      // Generate recommendations
      const recommendations = this.generateRecommendations(monthlyPerformance, overallPercentage, averagePerformance);

      const analysis: BudgetPerformanceAnalysis = {
        budgetId: budget.id,
        budgetName: budget.name,
        totalPlanned,
        totalActual,
        overallPercentage,
        monthlyPerformance: monthlyPerformance.reverse(), // Show oldest to newest
        averagePerformance,
        bestMonth,
        worstMonth,
        isOnTrack,
        recommendations
      };

      this.performanceAnalysis = analysis;
      this.loading = false;
      return analysis;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  async analyzeCategoryPerformance(budgetId: string): Promise<CategoryPerformance[]> {
    this.loading = true;
    this.error = null;

    try {
      const budgetItemsResult = await this.getBudgetItemsUseCase.execute({ budgetId });
      if (!budgetItemsResult.isSuccess()) {
        const error = budgetItemsResult.getOrThrow();
        throw error instanceof Error ? error : new Error('Failed to load budget items');
      }

      const budgetItems = budgetItemsResult.getOrElse({ budgetItems: [] }).budgetItems;

      // Group budget items by category
      const categoryMap = new Map<string, CategoryPerformance>();

      budgetItems.forEach(item => {
        const key = `${item.categoryName}-${item.categoryType}`;
        
        if (categoryMap.has(key)) {
          const existing = categoryMap.get(key)!;
          existing.plannedValue += item.plannedValue.value;
          existing.actualValue += item.actualValue?.value || 0;
          existing.budgetItemCount += 1;
        } else {
          categoryMap.set(key, {
            categoryName: item.categoryName,
            categoryType: item.categoryType,
            plannedValue: item.plannedValue.value,
            actualValue: item.actualValue?.value || 0,
            percentage: 0,
            variance: 0,
            budgetItemCount: 1
          });
        }
      });

      // Calculate percentages and variances
      const categoryPerformance: CategoryPerformance[] = Array.from(categoryMap.values()).map(category => {
        const percentage = category.plannedValue > 0 
          ? Math.round((category.actualValue / category.plannedValue) * 100) 
          : 0;
        const variance = category.actualValue - category.plannedValue;

        return {
          ...category,
          percentage,
          variance
        };
      });

      // Sort by variance (worst performers first)
      categoryPerformance.sort((a, b) => a.variance - b.variance);

      this.categoryPerformance = categoryPerformance;
      this.loading = false;
      return categoryPerformance;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  clearError(): void {
    this.error = null;
  }

  // Helper methods
  private formatMonth(date: Date): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private generateRecommendations(
    monthlyPerformance: PerformanceData[], 
    overallPercentage: number, 
    averagePerformance: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallPercentage > 100) {
      recommendations.push('Orçamento está sendo ultrapassado. Considere reduzir gastos ou aumentar a receita.');
    }

    if (averagePerformance < 80) {
      recommendations.push('Performance média está baixa. Revise as categorias com maior variação.');
    }

    if (monthlyPerformance.length > 0) {
      const recentMonths = monthlyPerformance.slice(-3);
      const recentAverage = recentMonths.reduce((sum, month) => sum + month.percentage, 0) / recentMonths.length;
      
      if (recentAverage < averagePerformance) {
        recommendations.push('Performance recente está piorando. Ajuste o planejamento para os próximos meses.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Orçamento está sendo executado conforme planejado. Continue mantendo o controle!');
    }

    return recommendations;
  }

  // Getters for current state
  getPerformanceAnalysis(): BudgetPerformanceAnalysis | null {
    return this.performanceAnalysis;
  }

  getCategoryPerformance(): CategoryPerformance[] {
    return this.categoryPerformance;
  }

  getLoadingState(): boolean {
    return this.loading;
  }

  getErrorState(): string | null {
    return this.error;
  }
}
