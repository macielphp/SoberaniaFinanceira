// Use Case: CreateGoalUseCase
// Responsável por criar uma nova meta (Goal)

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal } from '../entities/Goal';
import { Money } from '../../shared/utils/Money';

export interface CreateGoalRequest {
  description: string;
  targetValue: Money;
  startDate: Date;
  endDate: Date;
  monthlyIncome: Money;
  fixedExpenses: Money;
  availablePerMonth: Money;
  importance: 'baixa' | 'média' | 'alta';
  priority: number;
  type: 'economia' | 'compra';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  userId: string;
  strategy?: string;
  monthlyContribution: Money;
  numParcela: number;
}

export interface CreateGoalResponse {
  goal: Goal;
}

export class CreateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}

  async execute(request: CreateGoalRequest): Promise<Goal> {
    try {
      this.validateCreateData(request);

      // Create new goal
      const goal = new Goal({
        id: this.generateId(),
        userId: request.userId,
        description: request.description,
        type: request.type,
        targetValue: request.targetValue,
        startDate: request.startDate,
        endDate: request.endDate,
        monthlyIncome: request.monthlyIncome,
        fixedExpenses: request.fixedExpenses,
        availablePerMonth: request.availablePerMonth,
        importance: request.importance,
        priority: request.priority,
        strategy: request.strategy,
        monthlyContribution: request.monthlyContribution,
        numParcela: request.numParcela,
        status: request.status || 'active',
        createdAt: new Date(),
      });

      // Save to repository
      const savedGoal = await this.goalRepository.save(goal);
      return savedGoal;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('Descrição do objetivo é obrigatória') || 
            error.message.includes('Valor alvo deve ser positivo') ||
            error.message.includes('Prioridade deve ser entre 1 e 5') ||
            error.message.includes('Tipo de objetivo inválido')) {
          throw error;
        }
        // Wrap repository errors
        throw new Error('Erro ao salvar objetivo');
      }
      throw new Error('Erro ao salvar objetivo');
    }
  }

  private validateCreateData(data: CreateGoalRequest): void {
    if (!data.description || data.description.trim() === '') {
      throw new Error('Descrição do objetivo é obrigatória');
    }

    if (data.targetValue.value <= 0) {
      throw new Error('Valor alvo deve ser positivo');
    }

    if (data.priority < 1 || data.priority > 5) {
      throw new Error('Prioridade deve ser entre 1 e 5');
    }

    if (!data.type || !['economia', 'compra'].includes(data.type)) {
      throw new Error('Tipo de objetivo inválido');
    }

    if (data.endDate <= data.startDate) {
      throw new Error('Data de fim deve ser posterior à data de início');
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}