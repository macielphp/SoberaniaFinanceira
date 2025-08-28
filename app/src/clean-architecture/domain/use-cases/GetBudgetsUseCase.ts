// Use Case: GetBudgetsUseCase
// Responsável por buscar orçamentos com filtros opcionais

import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../entities/Budget';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting budgets
export interface GetBudgetsRequest {
  userId?: string;
  activeOnly?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Output DTO for the use case result
export interface GetBudgetsResponse {
  budgets: Budget[];
}

export class GetBudgetsUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(request: GetBudgetsRequest): Promise<Result<GetBudgetsResponse, Error>> {
    try {
      let budgets: Budget[];

      // Apply filters based on request
      if (request.activeOnly) {
        if (request.userId) {
          budgets = await this.budgetRepository.findActiveByUser(request.userId);
        } else {
          // For active only without userId, we need to get all budgets and filter by active status
          // Since there's no findActive() method, we'll use findAll and filter
          const allBudgets = await this.budgetRepository.findAll();
          budgets = allBudgets.filter(budget => budget.isActive);
        }
      } else if (request.userId) {
        budgets = await this.budgetRepository.findByUser(request.userId);
      } else if (request.dateRange) {
        budgets = await this.budgetRepository.findByDateRange(
          request.dateRange.start,
          request.dateRange.end
        );
      } else {
        budgets = await this.budgetRepository.findAll();
      }

      // Apply additional filters if multiple are provided
      if (request.userId && request.dateRange) {
        const userFiltered = await this.budgetRepository.findByUser(request.userId);
        const dateFiltered = await this.budgetRepository.findByDateRange(
          request.dateRange.start,
          request.dateRange.end
        );
        budgets = userFiltered.filter(budget => 
          dateFiltered.some(dateBudget => dateBudget.id === budget.id)
        );
      }

      return success<GetBudgetsResponse, Error>({
        budgets
      });

    } catch (error) {
      return failure<GetBudgetsResponse, Error>(
        new Error(`Failed to get budgets: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}
