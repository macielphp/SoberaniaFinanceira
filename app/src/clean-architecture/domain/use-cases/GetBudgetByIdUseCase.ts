// Use Case: GetBudgetByIdUseCase
// Responsável por buscar um orçamento específico por ID

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../entities/Budget';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting budget by ID
export interface GetBudgetByIdRequest {
  budgetId: string;
}

// Output DTO for the use case result
export interface GetBudgetByIdResponse {
  budget: Budget;
}

export class GetBudgetByIdUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(request: GetBudgetByIdRequest): Promise<Result<GetBudgetByIdResponse, Error>> {
    try {
      // Validate request
      if (!request.budgetId || request.budgetId.trim() === '') {
        return failure<GetBudgetByIdResponse, Error>(new Error('Budget ID cannot be empty'));
      }

      // Find budget by ID
      const budget = await this.budgetRepository.findById(request.budgetId);

      if (!budget) {
        return failure<GetBudgetByIdResponse, Error>(new Error('Budget not found'));
      }

      return success<GetBudgetByIdResponse, Error>({
        budget
      });

    } catch (error) {
      return failure<GetBudgetByIdResponse, Error>(
        new Error(`Failed to get budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}
