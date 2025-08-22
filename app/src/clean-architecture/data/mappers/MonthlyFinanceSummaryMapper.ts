// Mapper for MonthlyFinanceSummary entity
// Converts between DTO (database) and Domain Entity

import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';
import { MonthlyFinanceSummaryDTO } from '../dto/MonthlyFinanceSummaryDTO';
import { Money } from '../../shared/utils/Money';

export class MonthlyFinanceSummaryMapper {
  /**
   * Converts MonthlyFinanceSummaryDTO to MonthlyFinanceSummary domain entity
   */
  toDomain(dto: MonthlyFinanceSummaryDTO): MonthlyFinanceSummary {
    return new MonthlyFinanceSummary({
      id: dto.id,
      userId: dto.user_id,
      month: dto.month,
      totalIncome: new Money(dto.total_income, 'BRL'),
      totalExpense: new Money(dto.total_expense, 'BRL'),
      balance: new Money(dto.balance, 'BRL'),
      totalPlannedBudget: new Money(dto.total_planned_budget, 'BRL'),
      totalActualBudget: new Money(dto.total_actual_budget, 'BRL'),
      createdAt: new Date(dto.created_at)
    });
  }

  /**
   * Converts MonthlyFinanceSummary domain entity to MonthlyFinanceSummaryDTO
   */
  toDTO(monthlyFinanceSummary: MonthlyFinanceSummary): MonthlyFinanceSummaryDTO {
    return {
      id: monthlyFinanceSummary.id,
      user_id: monthlyFinanceSummary.userId,
      month: monthlyFinanceSummary.month,
      total_income: monthlyFinanceSummary.totalIncome.value,
      total_expense: monthlyFinanceSummary.totalExpense.value,
      balance: monthlyFinanceSummary.balance.value,
      total_planned_budget: monthlyFinanceSummary.totalPlannedBudget.value,
      total_actual_budget: monthlyFinanceSummary.totalActualBudget.value,
      created_at: monthlyFinanceSummary.createdAt.toISOString()
    };
  }

  /**
   * Converts array of MonthlyFinanceSummaryDTO to array of MonthlyFinanceSummary domain entities
   */
  toDomainList(dtos: MonthlyFinanceSummaryDTO[]): MonthlyFinanceSummary[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of MonthlyFinanceSummary domain entities to array of MonthlyFinanceSummaryDTO
   */
  toDTOList(monthlyFinanceSummaries: MonthlyFinanceSummary[]): MonthlyFinanceSummaryDTO[] {
    return monthlyFinanceSummaries.map(summary => this.toDTO(summary));
  }
}
