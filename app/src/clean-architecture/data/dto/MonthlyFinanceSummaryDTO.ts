// Data Transfer Object for MonthlyFinanceSummary
// Maps the SQLite database structure to the domain layer

export interface MonthlyFinanceSummaryDTO {
  id: string;
  user_id: string;
  month: string;
  total_income: number;
  total_expense: number;
  balance: number;
  total_planned_budget: number;
  total_actual_budget: number;
  created_at: string;
}
