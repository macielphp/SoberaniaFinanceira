export interface AlertDTO {
  id: string;
  account_id: string;
  account_name: string;
  type: 'low_balance' | 'negative_balance' | 'credit_limit';
  message: string;
  severity: 'warning' | 'error';
  value: number;
  threshold: number;
  is_dismissed: number; // SQLite stores boolean as integer
  created_at: string;   // ISO string
  dismissed_at: string | null; // ISO string or null
}
