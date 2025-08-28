// Use Case: GetMonthlyFinanceSummaryUseCase
// Responsável por buscar resumos financeiros mensais com filtros opcionais

import { IMonthlyFinanceSummaryRepository } from '../repositories/IMonthlyFinanceSummaryRepository';
import { MonthlyFinanceSummary } from '../entities/MonthlyFinanceSummary';
import { Result, success, failure } from '../../shared/utils/Result';

export interface GetMonthlyFinanceSummaryRequest {
  userId?: string;
  month?: string; // YYYY-MM format
}

export interface GetMonthlyFinanceSummaryResponse {
  monthlyFinanceSummaries: MonthlyFinanceSummary[];
}

export class GetMonthlyFinanceSummaryUseCase {
  constructor(private monthlyFinanceSummaryRepository: IMonthlyFinanceSummaryRepository) {}

  async execute(request: GetMonthlyFinanceSummaryRequest): Promise<Result<GetMonthlyFinanceSummaryResponse, Error>> {
    try {
      // Validate request parameters
      if (request.userId !== undefined && request.userId.trim() === '') {
        return failure<GetMonthlyFinanceSummaryResponse, Error>(new Error('User ID cannot be empty'));
      }
      if (request.month !== undefined && request.month.trim() === '') {
        return failure<GetMonthlyFinanceSummaryResponse, Error>(new Error('Month cannot be empty'));
      }
      if (request.month !== undefined) {
        const validationResult = this.validateMonthFormat(request.month);
        if (validationResult.isFailure()) {
          return validationResult.match(
            () => failure<GetMonthlyFinanceSummaryResponse, Error>(new Error('Validation failed')),
            (error) => failure<GetMonthlyFinanceSummaryResponse, Error>(error)
          );
        }
      }

      let monthlyFinanceSummaries: MonthlyFinanceSummary[];

      // Apply filters based on request
      if (request.userId && request.month) {
        monthlyFinanceSummaries = await this.monthlyFinanceSummaryRepository.findByUserAndMonth(request.userId, request.month);
      } else if (request.userId) {
        monthlyFinanceSummaries = await this.monthlyFinanceSummaryRepository.findByUser(request.userId);
      } else if (request.month) {
        monthlyFinanceSummaries = await this.monthlyFinanceSummaryRepository.findByMonth(request.month);
      } else {
        monthlyFinanceSummaries = await this.monthlyFinanceSummaryRepository.findAll();
      }

      return success<GetMonthlyFinanceSummaryResponse, Error>({
        monthlyFinanceSummaries
      });

    } catch (error) {
      return failure<GetMonthlyFinanceSummaryResponse, Error>(
        new Error(`Failed to get monthly finance summaries: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateMonthFormat(month: string): Result<void, Error> {
    if (!month || month.trim() === '') {
      return failure<void, Error>(new Error('Month cannot be empty'));
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return failure<void, Error>(new Error('Month must be in YYYY-MM format'));
    }

    const [year, monthNum] = month.split('-');
    const monthInt = parseInt(monthNum, 10);
    const yearInt = parseInt(year, 10);

    if (monthInt < 1 || monthInt > 12) {
      return failure<void, Error>(new Error('Month must be between 01 and 12'));
    }

    if (yearInt < 1900 || yearInt > 2100) {
      return failure<void, Error>(new Error('Year must be between 1900 and 2100'));
    }

    return success<void, Error>(undefined);
  }
}
