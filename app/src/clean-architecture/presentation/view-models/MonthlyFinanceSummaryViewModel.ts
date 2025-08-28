// ViewModel: MonthlyFinanceSummaryViewModel
// Responsável por gerenciar o estado e lógica de apresentação para resumos financeiros mensais

import { GetMonthlyFinanceSummaryUseCase, GetMonthlyFinanceSummaryRequest, GetMonthlyFinanceSummaryResponse } from '../../domain/use-cases/GetMonthlyFinanceSummaryUseCase';
import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';
import { Result, success, failure } from '../../shared/utils/Result';

export class MonthlyFinanceSummaryViewModel {
  constructor(
    private getMonthlyFinanceSummaryUseCase: GetMonthlyFinanceSummaryUseCase
  ) {}

  async getMonthlyFinanceSummaries(request: GetMonthlyFinanceSummaryRequest): Promise<Result<GetMonthlyFinanceSummaryResponse, Error>> {
    try {
      return await this.getMonthlyFinanceSummaryUseCase.execute(request);
    } catch (error) {
      return failure<GetMonthlyFinanceSummaryResponse, Error>(
        new Error(`Failed to get monthly finance summaries: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  async getMonthlyFinanceSummariesByUser(userId: string): Promise<Result<GetMonthlyFinanceSummaryResponse, Error>> {
    return this.getMonthlyFinanceSummaries({ userId });
  }

  async getMonthlyFinanceSummariesByMonth(month: string): Promise<Result<GetMonthlyFinanceSummaryResponse, Error>> {
    return this.getMonthlyFinanceSummaries({ month });
  }

  async getMonthlyFinanceSummaryByUserAndMonth(userId: string, month: string): Promise<Result<GetMonthlyFinanceSummaryResponse, Error>> {
    return this.getMonthlyFinanceSummaries({ userId, month });
  }
}
