// Data Transfer Object for Category
// Maps the SQLite database structure to the domain layer

export interface CategoryDTO {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  createdAt: string;
} 