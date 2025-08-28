// Use Case: DeleteBudgetUseCase
// Responsável por deletar um orçamento

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for deleting budgets
export interface DeleteBudgetRequest {
  budgetId: string;
}

// Output DTO for the use case result
export interface DeleteBudgetResponse {
  success: boolean;
}

export class DeleteBudgetUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: DeleteBudgetRequest): Promise<Result<DeleteBudgetResponse, Error>> {
    try {
      // Validate request
      if (!request.budgetId || request.budgetId.trim() === '') {
        return failure<DeleteBudgetResponse, Error>(new Error('Budget ID cannot be empty'));
      }

      // Check if budget exists
      const existingBudget = await this.budgetRepository.findById(request.budgetId);
      if (!existingBudget) {
        return failure<DeleteBudgetResponse, Error>(new Error('Budget not found'));
      }

      // Delete budget
      await this.budgetRepository.delete(request.budgetId);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createBudgetDeleted(request.budgetId);
        this.eventBus.publish('BudgetDeleted', event);
      }

      return success<DeleteBudgetResponse, Error>({
        success: true
      });

    } catch (error) {
      return failure<DeleteBudgetResponse, Error>(
        new Error(`Failed to delete budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}
