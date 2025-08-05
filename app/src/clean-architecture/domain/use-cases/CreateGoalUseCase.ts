// Use Case: CreateGoalUseCase
// Responsável por criar uma nova meta (Goal)

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal, GoalType, GoalImportance } from '../entities/Goal';
import { Result, success, failure } from '../../shared/utils/Result';
import { Money } from '../../shared/utils/Money';

// Input DTO for creating goals
export interface CreateGoalRequest {
  description: string;
  type: GoalType;
  targetValue: number;
  userId: string;
  startDate: Date;
  endDate: Date;
  monthlyIncome: number;
  fixedExpenses: number;
  availablePerMonth: number;
  importance: GoalImportance;
  priority: number;
  monthlyContribution: number;
  numParcela: number;
}

// Output DTO for the use case result
export interface CreateGoalResponse {
  goal: Goal;
}

export class CreateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}

  async execute(request: CreateGoalRequest): Promise<Result<CreateGoalResponse, Error>> {
    try {
      // Validação básica
      if (!request.description || request.description.trim() === '') {
        return failure<CreateGoalResponse, Error>(new Error('Goal description cannot be empty'));
      }
      if (!request.type || (request.type !== 'economia' && request.type !== 'compra')) {
        return failure<CreateGoalResponse, Error>(new Error('Invalid goal type'));
      }
      if (!request.userId || request.userId.trim() === '') {
        return failure<CreateGoalResponse, Error>(new Error('User ID cannot be empty'));
      }
      if (request.targetValue <= 0) {
        return failure<CreateGoalResponse, Error>(new Error('Target value must be greater than zero'));
      }
      if (request.monthlyIncome < 0 || request.fixedExpenses < 0 || request.availablePerMonth < 0 || request.monthlyContribution < 0) {
        return failure<CreateGoalResponse, Error>(new Error('Values must be non-negative'));
      }
      if (request.priority < 1 || request.priority > 5) {
        return failure<CreateGoalResponse, Error>(new Error('Priority must be between 1 and 5'));
      }
      if (!request.startDate || !request.endDate || request.endDate <= request.startDate) {
        return failure<CreateGoalResponse, Error>(new Error('End date must be after start date'));
      }

      // Criar Goal
      const goal = new Goal({
        id: this.generateId(),
        userId: request.userId,
        description: request.description,
        type: request.type,
        targetValue: new Money(request.targetValue, 'BRL'),
        startDate: request.startDate,
        endDate: request.endDate,
        monthlyIncome: new Money(request.monthlyIncome, 'BRL'),
        fixedExpenses: new Money(request.fixedExpenses, 'BRL'),
        availablePerMonth: new Money(request.availablePerMonth, 'BRL'),
        importance: request.importance,
        priority: request.priority,
        strategy: undefined,
        monthlyContribution: new Money(request.monthlyContribution, 'BRL'),
        numParcela: request.numParcela,
        status: 'active',
        createdAt: new Date()
      });

      // Salvar no repositório
      const savedGoal = await this.goalRepository.save(goal);
      return success<CreateGoalResponse, Error>({ goal: savedGoal });
    } catch (error) {
      return failure<CreateGoalResponse, Error>(
        new Error(`Failed to create goal${error instanceof Error ? ': ' + error.message : ''}`)
      );
    }
  }

  private generateId(): string {
    return `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}