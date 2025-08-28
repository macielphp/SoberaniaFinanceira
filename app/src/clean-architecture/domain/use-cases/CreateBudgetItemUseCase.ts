// Use Case: CreateBudgetItemUseCase
// Responsável por criar um novo item de orçamento

import { IBudgetItemRepository } from '../repositories/IBudgetItemRepository';
import { BudgetItem } from '../entities/BudgetItem';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

export interface CreateBudgetItemRequest {
  budgetId: string;
  categoryName: string;
  categoryType: 'expense' | 'income';
  plannedValue: any; // Money object
  actualValue?: any; // Money object
}

export interface CreateBudgetItemResponse {
  budgetItem: BudgetItem;
}

export class CreateBudgetItemUseCase {
  constructor(
    private budgetItemRepository: IBudgetItemRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: CreateBudgetItemRequest): Promise<Result<CreateBudgetItemResponse, Error>> {
    try {
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<CreateBudgetItemResponse, Error>(new Error('Validation failed')),
          (error) => failure<CreateBudgetItemResponse, Error>(error)
        );
      }

      const budgetItem = new BudgetItem({
        id: this.generateId(),
        budgetId: request.budgetId,
        categoryName: request.categoryName,
        categoryType: request.categoryType,
        plannedValue: request.plannedValue,
        actualValue: request.actualValue
      });

      const savedBudgetItem = await this.budgetItemRepository.save(budgetItem);

      if (this.eventBus) {
        const event = DomainEventFactory.createBudgetItemCreated(savedBudgetItem);
        this.eventBus.publish('BudgetItemCreated', event);
      }

      return success<CreateBudgetItemResponse, Error>({
        budgetItem: savedBudgetItem
      });

    } catch (error) {
      return failure<CreateBudgetItemResponse, Error>(
        new Error(`Failed to create budget item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: CreateBudgetItemRequest): Result<void, Error> {
    if (!request.budgetId || request.budgetId.trim() === '') {
      return failure<void, Error>(new Error('Budget ID cannot be empty'));
    }
    if (!request.categoryName || request.categoryName.trim() === '') {
      return failure<void, Error>(new Error('Budget item name cannot be empty'));
    }
    if (!request.categoryType || !['expense', 'income'].includes(request.categoryType)) {
      return failure<void, Error>(new Error('Invalid category type'));
    }
    if (request.plannedValue.value <= 0) {
      return failure<void, Error>(new Error('Budget item planned value cannot be zero or negative'));
    }
    if (request.actualValue && request.actualValue.value < 0) {
      return failure<void, Error>(new Error('Budget item actual value cannot be negative'));
    }
    return success<void, Error>(undefined);
  }

  private generateId(): string {
    return `budget-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
