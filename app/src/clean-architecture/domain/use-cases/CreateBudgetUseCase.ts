// Use Case: CreateBudgetUseCase
// Responsável por criar um novo orçamento

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../entities/Budget';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for creating budgets
export interface CreateBudgetRequest {
  userId: string;
  name: string;
  startPeriod: Date;
  endPeriod: Date;
  type: 'manual';
  totalPlannedValue: any; // Money object
}

// Output DTO for the use case result
export interface CreateBudgetResponse {
  budget: Budget;
}

export class CreateBudgetUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: CreateBudgetRequest): Promise<Result<CreateBudgetResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<CreateBudgetResponse, Error>(new Error('Validation failed')),
          (error) => failure<CreateBudgetResponse, Error>(error)
        );
      }

      // Create budget entity
      const budget = new Budget({
        id: this.generateId(),
        userId: request.userId,
        name: request.name,
        startPeriod: request.startPeriod,
        endPeriod: request.endPeriod,
        type: request.type,
        totalPlannedValue: request.totalPlannedValue
      });

      // Save budget
      const savedBudget = await this.budgetRepository.save(budget);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createBudgetCreated(savedBudget);
        this.eventBus.publish('BudgetCreated', event);
      }

      return success<CreateBudgetResponse, Error>({
        budget: savedBudget
      });

    } catch (error) {
      return failure<CreateBudgetResponse, Error>(
        new Error(`Failed to create budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: CreateBudgetRequest): Result<void, Error> {
    // Validate name
    if (!request.name || request.name.trim() === '') {
      return failure<void, Error>(new Error('Budget name cannot be empty'));
    }

    // Validate type
    if (!request.type || request.type !== 'manual') {
      return failure<void, Error>(new Error('Invalid budget type'));
    }

    // Validate planned value
    if (request.totalPlannedValue.value <= 0) {
      return failure<void, Error>(new Error('Budget planned value cannot be zero'));
    }

    // Validate date range
    if (request.endPeriod <= request.startPeriod) {
      return failure<void, Error>(new Error('End period must be after start period'));
    }

    // Validate userId
    if (!request.userId || request.userId.trim() === '') {
      return failure<void, Error>(new Error('User ID cannot be empty'));
    }

    return success<void, Error>(undefined);
  }

  private generateId(): string {
    return `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
