import { Goal } from '../../domain/entities/Goal';
import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { CreateGoalUseCase } from '../../domain/use-cases/CreateGoalUseCase';
import { UpdateGoalUseCase } from '../../domain/use-cases/UpdateGoalUseCase';
import { DeleteGoalUseCase } from '../../domain/use-cases/DeleteGoalUseCase';
import { GetGoalByIdUseCase } from '../../domain/use-cases/GetGoalByIdUseCase';
import { GetGoalsUseCase } from '../../domain/use-cases/GetGoalsUseCase';
import { Money } from '../../shared/utils/Money';
import { Result, success, failure } from '../../shared/utils/Result';

export interface CreateGoalData {
  userId: string;
  description: string;
  type: 'economia' | 'compra';
  targetValue: Money;
  startDate: Date;
  endDate: Date;
  monthlyIncome: Money;
  fixedExpenses: Money;
  availablePerMonth: Money;
  importance: 'baixa' | 'média' | 'alta';
  priority: number;
  strategy?: string;
  monthlyContribution: Money;
  numParcela: number;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}

export interface UpdateGoalData {
  description?: string;
  type?: 'economia' | 'compra';
  targetValue?: Money;
  startDate?: Date;
  endDate?: Date;
  monthlyIncome?: Money;
  fixedExpenses?: Money;
  availablePerMonth?: Money;
  importance?: 'baixa' | 'média' | 'alta';
  priority?: number;
  strategy?: string;
  monthlyContribution?: Money;
  numParcela?: number;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class GoalViewModel {
  public loading: boolean = false;
  public error: string | null = null;
  public goals: Goal[] = [];

  private createGoalUseCase: CreateGoalUseCase;
  private updateGoalUseCase: UpdateGoalUseCase;
  private deleteGoalUseCase: DeleteGoalUseCase;
  private getGoalByIdUseCase: GetGoalByIdUseCase;
  private getGoalsUseCase: GetGoalsUseCase;

  constructor(goalRepository: IGoalRepository) {
    this.createGoalUseCase = new CreateGoalUseCase(goalRepository);
    this.updateGoalUseCase = new UpdateGoalUseCase(goalRepository);
    this.deleteGoalUseCase = new DeleteGoalUseCase(goalRepository);
    this.getGoalByIdUseCase = new GetGoalByIdUseCase(goalRepository);
    this.getGoalsUseCase = new GetGoalsUseCase(goalRepository);
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.createGoalUseCase.execute(data);
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao criar meta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async updateGoal(goalId: string, data: UpdateGoalData): Promise<Goal> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.updateGoalUseCase.execute(goalId, data);
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar meta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.deleteGoalUseCase.execute(goalId);
      return result.match(
        (response) => response.deleted,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao deletar meta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async getGoalById(goalId: string): Promise<Goal | null> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getGoalByIdUseCase.execute(goalId);
      return result.match(
        (response) => response.goal,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao buscar meta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async getAllGoals(): Promise<Goal[]> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getGoalsUseCase.execute();
      const goals = result.match(
        (response) => response.goals,
        (error) => {
          this.error = error;
          throw new Error(error);
        }
      );
      this.goals = goals;
      return goals;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar metas';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  validateForm(data: CreateGoalData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar descrição
    if (!data.description || data.description.trim() === '') {
      errors.description = 'Descrição da meta é obrigatória';
    }

    // Validar valor alvo
    if (data.targetValue.value <= 0) {
      errors.targetValue = 'Valor alvo deve ser maior que zero';
    }

    // Validar data de início
    if (!data.startDate) {
      errors.startDate = 'Data de início é obrigatória';
    }

    // Validar data de fim
    if (!data.endDate) {
      errors.endDate = 'Data de fim é obrigatória';
    } else if (data.endDate <= new Date()) {
      errors.endDate = 'Data limite deve ser futura';
    }

    // Validar renda mensal
    if (data.monthlyIncome.value < 0) {
      errors.monthlyIncome = 'Renda mensal não pode ser negativa';
    }

    // Validar despesas fixas
    if (data.fixedExpenses.value < 0) {
      errors.fixedExpenses = 'Despesas fixas não podem ser negativas';
    }

    // Validar disponível por mês
    if (data.availablePerMonth.value < 0) {
      errors.availablePerMonth = 'Valor disponível por mês não pode ser negativo';
    }

    // Validar prioridade
    if (data.priority <= 0) {
      errors.priority = 'Prioridade deve ser maior que zero';
    }

    // Validar número de parcelas
    if (data.numParcela <= 0) {
      errors.numParcela = 'Número de parcelas deve ser maior que zero';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  calculateProgress(goal: Goal, currentValue: Money): number {
    if (goal.targetValue.value <= 0) {
      return 0;
    }

    const progress = (currentValue.value / goal.targetValue.value) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  // Getters for reactive properties
  get isLoading(): boolean {
    return this.loading;
  }

  setError(error: string): void {
    this.error = error;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}