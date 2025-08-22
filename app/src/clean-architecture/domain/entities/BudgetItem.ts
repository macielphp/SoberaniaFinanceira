// Domain Entity: BudgetItem
// Representa um item individual de orçamento por categoria

import { Money } from '../../shared/utils/Money';

// Types for BudgetItem
export type BudgetItemCategoryType = 'expense' | 'income';

// Interface for BudgetItem constructor
export interface BudgetItemProps {
  id: string;
  budgetId: string;
  categoryName: string;
  plannedValue: Money;
  categoryType: BudgetItemCategoryType;
  actualValue?: Money;
  createdAt?: Date;
}

export class BudgetItem {
  private readonly _id: string;
  private readonly _budgetId: string;
  private readonly _categoryName: string;
  private readonly _plannedValue: Money;
  private readonly _categoryType: BudgetItemCategoryType;
  private readonly _actualValue?: Money;
  private readonly _createdAt: Date;

  constructor(props: BudgetItemProps) {
    this._id = props.id;
    this._budgetId = props.budgetId;
    this._categoryName = props.categoryName;
    this._plannedValue = props.plannedValue;
    this._categoryType = props.categoryType;
    this._actualValue = props.actualValue;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get budgetId(): string { return this._budgetId; }
  get categoryName(): string { return this._categoryName; }
  get plannedValue(): Money { return this._plannedValue; }
  get categoryType(): BudgetItemCategoryType { return this._categoryType; }
  get actualValue(): Money | undefined { return this._actualValue; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateCategoryName();
    this.validateCategoryType();
    this.validatePlannedValue();
    this.validateActualValue();
  }

  private validateCategoryName(): void {
    if (!this._categoryName || this._categoryName.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
  }

  private validateCategoryType(): void {
    const validTypes: BudgetItemCategoryType[] = ['expense', 'income'];
    if (!validTypes.includes(this._categoryType)) {
      throw new Error(`Invalid category type: ${this._categoryType}`);
    }
  }

  private validatePlannedValue(): void {
    if (this._plannedValue.value < 0) {
      throw new Error('Planned value cannot be negative');
    }
  }

  private validateActualValue(): void {
    if (this._actualValue && this._actualValue.value < 0) {
      throw new Error('Actual value cannot be negative');
    }
  }

  // Business methods
  updatePlannedValue(newValue: Money): BudgetItem {
    if (newValue.value < 0) {
      throw new Error('Planned value cannot be negative');
    }

    return new BudgetItem({
      ...this.getProps(),
      plannedValue: newValue
    });
  }

  updateActualValue(newValue: Money): BudgetItem {
    if (newValue.value < 0) {
      throw new Error('Actual value cannot be negative');
    }

    return new BudgetItem({
      ...this.getProps(),
      actualValue: newValue
    });
  }

  clearActualValue(): BudgetItem {
    return new BudgetItem({
      ...this.getProps(),
      actualValue: undefined
    });
  }

  calculateVariance(): Money {
    if (!this._actualValue) {
      return new Money(0, this._plannedValue.currency);
    }

    const variance = this._plannedValue.value - this._actualValue.value;
    // Para valores negativos, usamos Math.abs para criar um Money positivo
    // e depois aplicamos o sinal correto
    return new Money(Math.abs(variance), this._plannedValue.currency);
  }

  calculatePercentageCompletion(): number {
    if (!this._actualValue || this._plannedValue.value === 0) {
      return 0;
    }

    const percentage = (this._actualValue.value / this._plannedValue.value) * 100;
    return Math.round(percentage);
  }

  isOverBudget(): boolean {
    if (!this._actualValue) {
      return false;
    }

    return this._actualValue.value > this._plannedValue.value;
  }

  isUnderBudget(): boolean {
    if (!this._actualValue) {
      return false;
    }

    return this._actualValue.value < this._plannedValue.value;
  }

  isOnBudget(): boolean {
    if (!this._actualValue) {
      return false;
    }

    return this._actualValue.value === this._plannedValue.value;
  }

  // Helper method to get all props (for immutability)
  private getProps(): BudgetItemProps {
    return {
      id: this._id,
      budgetId: this._budgetId,
      categoryName: this._categoryName,
      plannedValue: this._plannedValue,
      categoryType: this._categoryType,
      actualValue: this._actualValue,
      createdAt: this._createdAt
    };
  }
}
