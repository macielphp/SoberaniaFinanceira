// Data Transfer Object for Budget
// Maps the SQLite database structure to the domain layer

export interface BudgetDTO {
  id: string;
  user_id: string;
  name: string;
  start_period: string;
  end_period: string;
  type: 'manual';
  total_planned_value: number;
  is_active: boolean;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
}
