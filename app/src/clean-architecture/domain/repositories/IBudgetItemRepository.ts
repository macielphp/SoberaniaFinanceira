// Interface for BudgetItem Repository
// Defines the contract for BudgetItem data access operations

import { BudgetItem } from '../entities/BudgetItem';

export interface IBudgetItemRepository {
  save(budgetItem: BudgetItem): Promise<BudgetItem>;
  findById(id: string): Promise<BudgetItem | null>;
  findAll(): Promise<BudgetItem[]>;
  findByBudget(budgetId: string): Promise<BudgetItem[]>;
  findByCategory(categoryName: string): Promise<BudgetItem[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
