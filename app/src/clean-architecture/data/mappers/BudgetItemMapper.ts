// Mapper for BudgetItem entity
// Converts between DTO (database) and Domain Entity

import { BudgetItem } from '../../domain/entities/BudgetItem';
import { BudgetItemDTO } from '../dto/BudgetItemDTO';
import { Money } from '../../shared/utils/Money';

export class BudgetItemMapper {
  /**
   * Converts BudgetItemDTO to BudgetItem domain entity
   */
  toDomain(dto: BudgetItemDTO): BudgetItem {
    return new BudgetItem({
      id: dto.id,
      budgetId: dto.budget_id,
      categoryName: dto.category_name,
      plannedValue: new Money(dto.planned_value, 'BRL'),
      categoryType: dto.category_type,
      actualValue: dto.actual_value ? new Money(dto.actual_value, 'BRL') : undefined,
      createdAt: new Date(dto.created_at)
    });
  }

  /**
   * Converts BudgetItem domain entity to BudgetItemDTO
   */
  toDTO(budgetItem: BudgetItem): BudgetItemDTO {
    return {
      id: budgetItem.id,
      budget_id: budgetItem.budgetId,
      category_name: budgetItem.categoryName,
      planned_value: budgetItem.plannedValue.value,
      category_type: budgetItem.categoryType,
      actual_value: budgetItem.actualValue?.value || null,
      created_at: budgetItem.createdAt.toISOString()
    };
  }

  /**
   * Converts array of BudgetItemDTO to array of BudgetItem domain entities
   */
  toDomainList(dtos: BudgetItemDTO[]): BudgetItem[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of BudgetItem domain entities to array of BudgetItemDTO
   */
  toDTOList(budgetItems: BudgetItem[]): BudgetItemDTO[] {
    return budgetItems.map(budgetItem => this.toDTO(budgetItem));
  }
}
