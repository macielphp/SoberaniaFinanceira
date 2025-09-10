// ViewModel: BudgetViewModel
// Gerencia o estado e lógica de apresentação para orçamentos
// Segue Clean Architecture - conecta UI aos Use Cases

import { Budget } from '../../domain/entities/Budget';
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { CreateBudgetUseCase } from '../../domain/use-cases/CreateBudgetUseCase';
import { UpdateBudgetUseCase } from '../../domain/use-cases/UpdateBudgetUseCase';
import { DeleteBudgetUseCase } from '../../domain/use-cases/DeleteBudgetUseCase';
import { GetBudgetsUseCase } from '../../domain/use-cases/GetBudgetsUseCase';
import { GetBudgetByIdUseCase } from '../../domain/use-cases/GetBudgetByIdUseCase';
import { ActivateBudgetUseCase } from '../../domain/use-cases/ActivateBudgetUseCase';

export interface CreateBudgetData {
  userId: string;
  name: string;
  startPeriod: Date;
  endPeriod: Date;
  type: 'manual';
  totalPlannedValue: import('../../shared/utils/Money').Money;
}

export interface UpdateBudgetData {
  name?: string;
  startPeriod?: Date;
  endPeriod?: Date;
  type?: 'manual';
  totalPlannedValue?: import('../../shared/utils/Money').Money;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'expired';
}

export class BudgetViewModel {
  public loading: boolean = false;
  public error: string | null = null;
  public budgets: Budget[] = [];
  public currentBudget: Budget | null = null;

  private createBudgetUseCase: CreateBudgetUseCase;
  private updateBudgetUseCase: UpdateBudgetUseCase;
  private deleteBudgetUseCase: DeleteBudgetUseCase;
  private getBudgetsUseCase: GetBudgetsUseCase;
  private getBudgetByIdUseCase: GetBudgetByIdUseCase;
  private activateBudgetUseCase: ActivateBudgetUseCase;

  constructor(budgetRepository: IBudgetRepository) {
    this.createBudgetUseCase = new CreateBudgetUseCase(budgetRepository);
    this.updateBudgetUseCase = new UpdateBudgetUseCase(budgetRepository);
    this.deleteBudgetUseCase = new DeleteBudgetUseCase(budgetRepository);
    this.getBudgetsUseCase = new GetBudgetsUseCase(budgetRepository);
    this.getBudgetByIdUseCase = new GetBudgetByIdUseCase(budgetRepository);
    this.activateBudgetUseCase = new ActivateBudgetUseCase(budgetRepository);
  }

  // Public methods
  async loadBudgets(userId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.getBudgetsUseCase.execute({ userId });
      
      if (result.isSuccess()) {
        this.budgets = result.getOrElse({ budgets: [] }).budgets;
      } else {
        const error = result.getOrThrow();
        this.error = error instanceof Error ? error.message : 'Failed to load budgets';
        this.budgets = [];
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.budgets = [];
    } finally {
      this.loading = false;
    }
  }

  async createBudget(budgetData: CreateBudgetData): Promise<Budget> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.createBudgetUseCase.execute(budgetData);
      
      if (result.isSuccess()) {
        const budget = result.getOrElse({ budget: null as any }).budget;
        if (budget) {
          this.budgets.push(budget);
          this.loading = false;
          return budget;
        }
      }
      
      const error = result.getOrThrow();
      this.error = error instanceof Error ? error.message : 'Failed to create budget';
      this.loading = false;
      throw new Error(this.error);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  async updateBudget(budgetId: string, updateData: UpdateBudgetData): Promise<Budget> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.updateBudgetUseCase.execute({ budgetId, ...updateData });
      
      if (result.isSuccess()) {
        const budget = result.getOrElse({ budget: null as any }).budget;
        if (budget) {
          // Update the budget in the list
          const index = this.budgets.findIndex(b => b.id === budgetId);
          if (index !== -1) {
            this.budgets[index] = budget;
          }

          // Update current budget if it's the same
          if (this.currentBudget?.id === budgetId) {
            this.currentBudget = budget;
          }
          
          this.loading = false;
          return budget;
        }
      }
      
      const error = result.getOrThrow();
      this.error = error instanceof Error ? error.message : 'Failed to update budget';
      this.loading = false;
      throw new Error(this.error);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  async deleteBudget(budgetId: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.deleteBudgetUseCase.execute({ budgetId });
      
      if (result.isSuccess()) {
        const success = result.getOrElse({ success: false }).success;
        if (success) {
          // Remove the budget from the list
          this.budgets = this.budgets.filter(budget => budget.id !== budgetId);

          // Clear current budget if it's the same
          if (this.currentBudget?.id === budgetId) {
            this.currentBudget = null;
          }
        }
        
        this.loading = false;
        return success;
      }
      
      const error = result.getOrThrow();
      this.error = error instanceof Error ? error.message : 'Failed to delete budget';
      this.loading = false;
      throw new Error(this.error);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  async getBudgetById(budgetId: string): Promise<Budget> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.getBudgetByIdUseCase.execute({ budgetId });
      
      if (result.isSuccess()) {
        const budget = result.getOrElse({ budget: null as any }).budget;
        if (budget) {
          this.currentBudget = budget;
          this.loading = false;
          return budget;
        }
      }
      
      const error = result.getOrThrow();
      this.error = error instanceof Error ? error.message : 'Budget not found';
      this.currentBudget = null;
      this.loading = false;
      throw new Error(this.error);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.currentBudget = null;
      this.loading = false;
      throw error;
    }
  }

  async activateBudget(budgetId: string): Promise<Budget> {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.activateBudgetUseCase.execute({ budgetId });
      
      if (result.isSuccess()) {
        const budget = result.getOrElse({ budget: null as any }).budget;
        if (budget) {
          // Update the budget in the list
          const index = this.budgets.findIndex(b => b.id === budgetId);
          if (index !== -1) {
            this.budgets[index] = budget;
          }

          // Update current budget if it's the same
          if (this.currentBudget?.id === budgetId) {
            this.currentBudget = budget;
          }
          
          this.loading = false;
          return budget;
        }
      }
      
      const error = result.getOrThrow();
      this.error = error instanceof Error ? error.message : 'Failed to activate budget';
      this.loading = false;
      throw new Error(this.error);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.loading = false;
      throw error;
    }
  }

  clearError(): void {
    this.error = null;
  }

  setCurrentBudget(budget: Budget | null): void {
    this.currentBudget = budget;
  }

  // Helper methods
  getActiveBudgets(): Budget[] {
    return this.budgets.filter(budget => budget.isActive);
  }

  getBudgetsByType(type: 'manual'): Budget[] {
    return this.budgets.filter(budget => budget.type === type);
  }

  getBudgetsByDateRange(startDate: Date, endDate: Date): Budget[] {
    return this.budgets.filter(budget => {
      const budgetStart = budget.startPeriod;
      const budgetEnd = budget.endPeriod;
      
      return (
        (budgetStart >= startDate && budgetStart <= endDate) ||
        (budgetEnd >= startDate && budgetEnd <= endDate) ||
        (budgetStart <= startDate && budgetEnd >= endDate)
      );
    });
  }

  getBudgetsByStatus(status: 'active' | 'inactive' | 'expired'): Budget[] {
    return this.budgets.filter(budget => budget.status === status);
  }

  getTotalPlannedValue(): number {
    return this.budgets.reduce((total, budget) => {
      return total + budget.totalPlannedValue.value;
    }, 0);
  }

  getTotalPlannedValueByType(type: 'manual'): number {
    return this.getBudgetsByType(type).reduce((total, budget) => {
      return total + budget.totalPlannedValue.value;
    }, 0);
  }

  getBudgetsCount(): number {
    return this.budgets.length;
  }

  getActiveBudgetsCount(): number {
    return this.getActiveBudgets().length;
  }

  hasActiveBudgets(): boolean {
    return this.getActiveBudgets().length > 0;
  }

  isBudgetActive(budgetId: string): boolean {
    const budget = this.budgets.find(b => b.id === budgetId);
    return budget ? budget.isActive : false;
  }

  getBudgetByIdSync(budgetId: string): Budget | null {
    return this.budgets.find(budget => budget.id === budgetId) || null;
  }
}