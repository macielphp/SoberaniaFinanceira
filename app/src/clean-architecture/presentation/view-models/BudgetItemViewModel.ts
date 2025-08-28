// ViewModel: BudgetItemViewModel
// Responsável por gerenciar o estado e lógica de apresentação para itens de orçamento

import { CreateBudgetItemUseCase, CreateBudgetItemRequest, CreateBudgetItemResponse } from '../../domain/use-cases/CreateBudgetItemUseCase';
import { GetBudgetItemsUseCase, GetBudgetItemsRequest, GetBudgetItemsResponse } from '../../domain/use-cases/GetBudgetItemsUseCase';
import { BudgetItem } from '../../domain/entities/BudgetItem';
import { Result, success, failure } from '../../shared/utils/Result';

export class BudgetItemViewModel {
  constructor(
    private createBudgetItemUseCase: CreateBudgetItemUseCase,
    private getBudgetItemsUseCase: GetBudgetItemsUseCase
  ) {}

  async createBudgetItem(request: CreateBudgetItemRequest): Promise<Result<CreateBudgetItemResponse, Error>> {
    try {
      return await this.createBudgetItemUseCase.execute(request);
    } catch (error) {
      return failure<CreateBudgetItemResponse, Error>(
        new Error(`Failed to create budget item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  async getBudgetItems(request: GetBudgetItemsRequest): Promise<Result<GetBudgetItemsResponse, Error>> {
    try {
      return await this.getBudgetItemsUseCase.execute(request);
    } catch (error) {
      return failure<GetBudgetItemsResponse, Error>(
        new Error(`Failed to get budget items: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  async getBudgetItemsByBudget(budgetId: string): Promise<Result<GetBudgetItemsResponse, Error>> {
    return this.getBudgetItems({ budgetId });
  }

  async getBudgetItemsByCategory(categoryName: string): Promise<Result<GetBudgetItemsResponse, Error>> {
    return this.getBudgetItems({ categoryName });
  }
}
