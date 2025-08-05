// Domain Entity: Category
// Representa uma categoria de operação financeira no sistema

// Types for Category
export type CategoryType = 'income' | 'expense';

// Interface for Category constructor
export interface CategoryProps {
  id: string;
  name: string;
  type: CategoryType;
  isDefault?: boolean;
  createdAt?: Date;
}

export class Category {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _type: CategoryType;
  private readonly _isDefault: boolean;
  private readonly _createdAt: Date;

  constructor(props: CategoryProps) {
    this._id = props.id;
    this._name = props.name;
    this._type = props.type;
    this._isDefault = props.isDefault ?? false;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get type(): CategoryType { return this._type; }
  get isDefault(): boolean { return this._isDefault; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateName();
    this.validateType();
  }

  private validateName(): void {
    if (!this._name || this._name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
  }

  private validateType(): void {
    const validTypes: CategoryType[] = ['income', 'expense'];
    if (!validTypes.includes(this._type)) {
      throw new Error(`Invalid category type: ${this._type}`);
    }
  }

  // Business methods
  isIncome(): boolean {
    return this._type === 'income';
  }

  isExpense(): boolean {
    return this._type === 'expense';
  }

  // Utility methods
  private getProps(): CategoryProps {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      isDefault: this._isDefault,
      createdAt: this._createdAt
    };
  }

  // Equality
  equals(other: Category): boolean {
    return this._id === other._id;
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      isDefault: this._isDefault,
      createdAt: this._createdAt.toISOString()
    };
  }
} 