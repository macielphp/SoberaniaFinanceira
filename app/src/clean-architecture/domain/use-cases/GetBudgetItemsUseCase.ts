// Use Case: GetBudgetItemsUseCase
// Responsável por buscar itens de orçamento com filtros opcionais

import { IBudgetItemRepository } from '../repositories/IBudgetItemRepository';
import { BudgetItem } from '../entities/BudgetItem';
import { Result, success, failure } from '../../shared/utils/Result';

export interface GetBudgetItemsRequest {
  budgetId?: string;
  categoryName?: string;
}

export interface GetBudgetItemsResponse {
  budgetItems: BudgetItem[];
}

export class GetBudgetItemsUseCase {
  constructor(private budgetItemRepository: IBudgetItemRepository) {}

  async execute(request: GetBudgetItemsRequest): Promise<Result<GetBudgetItemsResponse, Error>> {
    try {
      // Validate request parameters
      if (request.budgetId !== undefined && request.budgetId.trim() === '') {
        return failure<GetBudgetItemsResponse, Error>(new Error('Budget ID cannot be empty'));
      }
      if (request.categoryName !== undefined && request.categoryName.trim() === '') {
        return failure<GetBudgetItemsResponse, Error>(new Error('Category name cannot be empty'));
      }

      let budgetItems: BudgetItem[];

      // Apply filters based on request
      if (request.budgetId && request.categoryName) {
        // Get items by budget and then filter by category
        const budgetItemsByBudget = await this.budgetItemRepository.findByBudget(request.budgetId);
        const categoryItems = await this.budgetItemRepository.findByCategory(request.categoryName);
        
        // Find intersection of both arrays
        const budgetItemIds = new Set(budgetItemsByBudget.map(item => item.id));
        budgetItems = categoryItems.filter(item => budgetItemIds.has(item.id));
      } else if (request.budgetId) {
        budgetItems = await this.budgetItemRepository.findByBudget(request.budgetId);
      } else if (request.categoryName) {
        budgetItems = await this.budgetItemRepository.findByCategory(request.categoryName);
      } else {
        budgetItems = await this.budgetItemRepository.findAll();
      }

      return success<GetBudgetItemsResponse, Error>({
        budgetItems
      });

    } catch (error) {
      return failure<GetBudgetItemsResponse, Error>(
        new Error(`Failed to get budget items: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}
