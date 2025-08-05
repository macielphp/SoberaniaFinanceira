// Use Case: UpdateGoalUseCase
// Responsável por atualizar uma meta existente

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal, GoalType, GoalImportance } from '../entities/Goal';
import { Result, success, failure } from '../../shared/utils/Result';
import { Money } from '../../shared/utils/Money';

// Input DTO for updating goals
export interface UpdateGoalRequest {
  id: string;
  description?: string;
  type?: GoalType;
  targetValue?: number;
  startDate?: Date;
  endDate?: Date;
  monthlyIncome?: number;
  fixedExpenses?: number;
  availablePerMonth?: number;
  importance?: GoalImportance;
  priority?: number;
  strategy?: string;
  monthlyContribution?: number;
  numParcela?: number;
  status?: string;
}

// Output DTO for the use case result
export interface UpdateGoalResponse {
  goal: Goal;
}

export class UpdateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}

  async execute(request: UpdateGoalRequest): Promise<Result<UpdateGoalResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return failure<UpdateGoalResponse, Error>(validationResult.getOrThrow());
      }

      // Find existing goal
      const existingGoal = await this.goalRepository.findById(request.id);
      if (!existingGoal) {
        return failure<UpdateGoalResponse, Error>(new Error('Goal not found'));
      }

      // Create updated goal with new values
      const updatedGoal = new Goal({
        id: existingGoal.id,
        userId: existingGoal.userId,
        description: request.description ?? existingGoal.description,
        type: request.type ?? existingGoal.type,
        targetValue: request.targetValue ? new Money(request.targetValue, 'BRL') : existingGoal.targetValue,
        startDate: request.startDate ?? existingGoal.startDate,
        endDate: request.endDate ?? existingGoal.endDate,
        monthlyIncome: request.monthlyIncome ? new Money(request.monthlyIncome, 'BRL') : existingGoal.monthlyIncome,
        fixedExpenses: request.fixedExpenses ? new Money(request.fixedExpenses, 'BRL') : existingGoal.fixedExpenses,
        availablePerMonth: request.availablePerMonth ? new Money(request.availablePerMonth, 'BRL') : existingGoal.availablePerMonth,
        importance: request.importance ?? existingGoal.importance,
        priority: request.priority ?? existingGoal.priority,
        strategy: request.strategy ?? existingGoal.strategy,
        monthlyContribution: request.monthlyContribution ? new Money(request.monthlyContribution, 'BRL') : existingGoal.monthlyContribution,
        numParcela: request.numParcela ?? existingGoal.numParcela,
        status: request.status as any ?? existingGoal.status,
        createdAt: existingGoal.createdAt
      });

      // Save updated goal
      const savedGoal = await this.goalRepository.save(updatedGoal);
      return success<UpdateGoalResponse, Error>({ goal: savedGoal });
    } catch (error) {
      return failure<UpdateGoalResponse, Error>(
        new Error(`Failed to update goal${error instanceof Error ? ': ' + error.message : ''}`)
      );
    }
  }

  private validateRequest(request: UpdateGoalRequest): Result<Error, Error> {
    // Validate ID
    if (!request.id || request.id.trim() === '') {
      return failure<Error, Error>(new Error('Goal ID cannot be empty'));
    }

    // Validate description if provided
    if (request.description !== undefined && (!request.description || request.description.trim() === '')) {
      return failure<Error, Error>(new Error('Goal description cannot be empty'));
    }

    // Validate type if provided
    if (request.type !== undefined && (request.type !== 'economia' && request.type !== 'compra')) {
      return failure<Error, Error>(new Error('Invalid goal type'));
    }

    // Validate priority if provided
    if (request.priority !== undefined && (request.priority < 1 || request.priority > 5)) {
      return failure<Error, Error>(new Error('Priority must be between 1 and 5'));
    }

    // Validate target value if provided
    if (request.targetValue !== undefined && request.targetValue <= 0) {
      return failure<Error, Error>(new Error('Target value must be greater than zero'));
    }

    // Validate financial values if provided
    if (request.monthlyIncome !== undefined && request.monthlyIncome < 0) {
      return failure<Error, Error>(new Error('Monthly income must be non-negative'));
    }
    if (request.fixedExpenses !== undefined && request.fixedExpenses < 0) {
      return failure<Error, Error>(new Error('Fixed expenses must be non-negative'));
    }
    if (request.availablePerMonth !== undefined && request.availablePerMonth < 0) {
      return failure<Error, Error>(new Error('Available per month must be non-negative'));
    }
    if (request.monthlyContribution !== undefined && request.monthlyContribution < 0) {
      return failure<Error, Error>(new Error('Monthly contribution must be non-negative'));
    }

    // Validate dates if provided
    if (request.startDate && request.endDate && request.endDate <= request.startDate) {
      return failure<Error, Error>(new Error('End date must be after start date'));
    }

    return success<Error, Error>(new Error('Validation passed'));
  }
} 