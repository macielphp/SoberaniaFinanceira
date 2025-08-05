// Data Transfer Object for Goal
// Maps the SQLite database structure to the domain layer

export interface GoalDTO {
  id: string;
  user_id: string;
  description: string;
  type: 'economia' | 'compra';
  target_value: number;
  start_date: string;
  end_date: string;
  monthly_income: number;
  fixed_expenses: number;
  available_per_month: number;
  importance: string;
  priority: number;
  strategy?: string;
  monthly_contribution: number;
  num_parcela: number;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
} 