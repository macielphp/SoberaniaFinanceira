// Use Case: ActivateBudgetUseCase
// Responsável por ativar um orçamento

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../entities/Budget';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for activating budgets
export interface ActivateBudgetRequest {
  budgetId: string;
}

// Output DTO for the use case result
export interface ActivateBudgetResponse {
  budget: Budget;
}

export class ActivateBudgetUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: ActivateBudgetRequest): Promise<Result<ActivateBudgetResponse, Error>> {
    try {
      // Validate request
      if (!request.budgetId || request.budgetId.trim() === '') {
        return failure<ActivateBudgetResponse, Error>(new Error('Budget ID cannot be empty'));
      }

      // Find existing budget
      const existingBudget = await this.budgetRepository.findById(request.budgetId);
      if (!existingBudget) {
        return failure<ActivateBudgetResponse, Error>(new Error('Budget not found'));
      }

      // Check if budget is already active
      if (existingBudget.isActive) {
        return failure<ActivateBudgetResponse, Error>(new Error('Budget is already active'));
      }

      // Create activated budget
      const activatedBudget = new Budget({
        id: existingBudget.id,
        userId: existingBudget.userId,
        name: existingBudget.name,
        startPeriod: existingBudget.startPeriod,
        endPeriod: existingBudget.endPeriod,
        type: existingBudget.type,
        totalPlannedValue: existingBudget.totalPlannedValue,
        isActive: true,
        status: 'active',
        createdAt: existingBudget.createdAt
      });

      // Save activated budget
      const savedBudget = await this.budgetRepository.save(activatedBudget);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createBudgetUpdated(savedBudget);
        this.eventBus.publish('BudgetUpdated', event);
      }

      return success<ActivateBudgetResponse, Error>({
        budget: savedBudget
      });

    } catch (error) {
      return failure<ActivateBudgetResponse, Error>(
        new Error(`Failed to activate budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}
