// Mapper for Budget entity
// Converts between DTO (database) and Domain Entity

import { Budget, BudgetType, BudgetStatus } from '../../domain/entities/Budget';
import { BudgetDTO } from '../dto/BudgetDTO';
import { Money } from '../../shared/utils/Money';

export class BudgetMapper {
  /**
   * Converts BudgetDTO to Budget domain entity
   */
  toDomain(dto: BudgetDTO): Budget {
    return new Budget({
      id: dto.id,
      userId: dto.user_id,
      name: dto.name,
      startPeriod: new Date(dto.start_period),
      endPeriod: new Date(dto.end_period),
      type: dto.type,
      totalPlannedValue: new Money(dto.total_planned_value, 'BRL'),
      isActive: Boolean(dto.is_active),
      status: dto.status,
      createdAt: new Date(dto.created_at)
    });
  }

  /**
   * Converts Budget domain entity to BudgetDTO
   */
  toDTO(budget: Budget): BudgetDTO {
    return {
      id: budget.id,
      user_id: budget.userId,
      name: budget.name,
      start_period: budget.startPeriod.toISOString(),
      end_period: budget.endPeriod.toISOString(),
      type: budget.type,
      total_planned_value: budget.totalPlannedValue.value,
      is_active: budget.isActive,
      status: budget.status,
      created_at: budget.createdAt.toISOString()
    };
  }

  /**
   * Converts array of BudgetDTO to array of Budget domain entities
   */
  toDomainList(dtos: BudgetDTO[]): Budget[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of Budget domain entities to array of BudgetDTO
   */
  toDTOList(budgets: Budget[]): BudgetDTO[] {
    return budgets.map(budget => this.toDTO(budget));
  }
}
