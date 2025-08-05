// Mapper for Goal entity
// Converts between DTO (database) and Domain Entity

import { Goal } from '../../domain/entities/Goal';
import { GoalDTO } from '../dto/GoalDTO';
import { Money } from '../../shared/utils/Money';

export class GoalMapper {
  /**
   * Converts GoalDTO to Goal domain entity
   */
  toDomain(dto: GoalDTO): Goal {
    return new Goal({
      id: dto.id,
      description: dto.description,
      type: dto.type,
      targetValue: new Money(dto.target_value, 'BRL'),
      startDate: new Date(dto.start_date),
      endDate: new Date(dto.end_date),
      monthlyIncome: new Money(dto.monthly_income, 'BRL'),
      fixedExpenses: new Money(dto.fixed_expenses, 'BRL'),
      availablePerMonth: new Money(dto.available_per_month, 'BRL'),
      importance: dto.importance as any,
      priority: dto.priority,
      monthlyContribution: new Money(dto.monthly_contribution, 'BRL'),
      numParcela: dto.num_parcela,
      status: dto.status as any,
      userId: dto.user_id
    });
  }

  /**
   * Converts Goal domain entity to GoalDTO
   */
  toDTO(goal: Goal): GoalDTO {
    return {
      id: goal.id,
      user_id: goal.userId,
      description: goal.description,
      type: goal.type,
      target_value: goal.targetValue.value,
      start_date: goal.startDate.toISOString(),
      end_date: goal.endDate.toISOString(),
      monthly_income: goal.monthlyIncome.value,
      fixed_expenses: goal.fixedExpenses.value,
      available_per_month: goal.availablePerMonth.value,
      importance: goal.importance,
      priority: goal.priority,
      strategy: undefined, // Domain doesn't have strategy field
      monthly_contribution: goal.monthlyContribution.value,
      num_parcela: goal.numParcela,
      status: goal.status,
      created_at: goal.createdAt.toISOString(),
      updated_at: goal.createdAt.toISOString() // Domain doesn't have updatedAt, use createdAt
    };
  }

  /**
   * Converts array of GoalDTO to array of Goal entities
   */
  toDomainList(dtos: GoalDTO[]): Goal[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of Goal entities to array of GoalDTO
   */
  toDTOList(goals: Goal[]): GoalDTO[] {
    return goals.map(goal => this.toDTO(goal));
  }
} 