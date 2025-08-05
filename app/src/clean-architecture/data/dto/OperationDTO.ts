// Data Transfer Object for Operation
// Maps the SQLite database structure to the domain layer

export interface OperationDTO {
  id: string;
  user_id: string;
  nature: 'receita' | 'despesa';
  state: string;
  paymentMethod: string;
  sourceAccount: string;
  destinationAccount: string;
  date: string;
  value: number;
  category: string;
  details?: string;
  receipt?: Uint8Array | null;
  goal_id?: string | null;
  createdAt: string;
} 