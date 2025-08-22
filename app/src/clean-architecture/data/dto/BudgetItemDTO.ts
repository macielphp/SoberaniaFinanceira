// Data Transfer Object for BudgetItem
// Maps the SQLite database structure to the domain layer

export interface BudgetItemDTO {
  id: string;
  budget_id: string;
  category_name: string;
  planned_value: number;
  category_type: 'expense' | 'income';
  actual_value: number | null;
  created_at: string;
}
