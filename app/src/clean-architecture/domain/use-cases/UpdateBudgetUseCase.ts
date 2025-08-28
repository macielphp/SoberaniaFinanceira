// Use Case: UpdateBudgetUseCase
// Responsável por atualizar um orçamento existente

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../entities/Budget';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for updating budgets
export interface UpdateBudgetRequest {
  budgetId: string;
  name?: string;
  startPeriod?: Date;
  endPeriod?: Date;
  totalPlannedValue?: any; // Money object
}

// Output DTO for the use case result
export interface UpdateBudgetResponse {
  budget: Budget;
}

export class UpdateBudgetUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: UpdateBudgetRequest): Promise<Result<UpdateBudgetResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<UpdateBudgetResponse, Error>(new Error('Validation failed')),
          (error) => failure<UpdateBudgetResponse, Error>(error)
        );
      }

      // Find existing budget
      const existingBudget = await this.budgetRepository.findById(request.budgetId);
      if (!existingBudget) {
        return failure<UpdateBudgetResponse, Error>(new Error('Budget not found'));
      }

      // Create updated budget with new data
      const updatedBudget = new Budget({
        id: existingBudget.id,
        userId: existingBudget.userId,
        name: request.name || existingBudget.name,
        startPeriod: request.startPeriod || existingBudget.startPeriod,
        endPeriod: request.endPeriod || existingBudget.endPeriod,
        type: existingBudget.type,
        totalPlannedValue: request.totalPlannedValue || existingBudget.totalPlannedValue,
        isActive: existingBudget.isActive,
        status: existingBudget.status,
        createdAt: existingBudget.createdAt
      });

      // Save updated budget
      const savedBudget = await this.budgetRepository.save(updatedBudget);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createBudgetUpdated(savedBudget);
        this.eventBus.publish('BudgetUpdated', event);
      }

      return success<UpdateBudgetResponse, Error>({
        budget: savedBudget
      });

    } catch (error) {
      return failure<UpdateBudgetResponse, Error>(
        new Error(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: UpdateBudgetRequest): Result<void, Error> {
    // Validate budget ID
    if (!request.budgetId || request.budgetId.trim() === '') {
      return failure<void, Error>(new Error('Budget ID cannot be empty'));
    }

    // Validate name if provided
    if (request.name !== undefined && (!request.name || request.name.trim() === '')) {
      return failure<void, Error>(new Error('Budget name cannot be empty'));
    }

    // Validate planned value if provided
    if (request.totalPlannedValue && request.totalPlannedValue.value <= 0) {
      return failure<void, Error>(new Error('Budget planned value cannot be zero or negative'));
    }

    // Validate date range if provided
    if (request.startPeriod && request.endPeriod && request.endPeriod <= request.startPeriod) {
      return failure<void, Error>(new Error('End period must be after start period'));
    }

    return success<void, Error>(undefined);
  }
}
