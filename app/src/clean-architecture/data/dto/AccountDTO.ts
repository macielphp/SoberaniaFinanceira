// Data Transfer Object for Account
// Maps the SQLite database structure to the domain layer

export interface AccountDTO {
  id: string;
  name: string;
  type: 'propria' | 'externa';
  saldo?: number | null; // Only for 'propria' accounts
  isDefault: boolean;
  createdAt: string;
} 