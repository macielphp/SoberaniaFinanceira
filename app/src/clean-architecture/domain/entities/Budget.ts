// Domain Entity: Budget
// Representa um orçamento financeiro no sistema

import { Money } from '../../shared/utils/Money';

// Types for Budget
export type BudgetType = 'manual';
export type BudgetStatus = 'active' | 'inactive' | 'expired';

// Interface for Budget constructor
export interface BudgetProps {
  id: string;
  userId: string;
  name: string;
  startPeriod: Date;
  endPeriod: Date;
  type: BudgetType;
  totalPlannedValue: Money;
  isActive?: boolean;
  status?: BudgetStatus;
  createdAt?: Date;
}

export class Budget {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _name: string;
  private readonly _startPeriod: Date;
  private readonly _endPeriod: Date;
  private readonly _type: BudgetType;
  private readonly _totalPlannedValue: Money;
  private readonly _isActive: boolean;
  private readonly _status: BudgetStatus;
  private readonly _createdAt: Date;

  constructor(props: BudgetProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._name = props.name;
    this._startPeriod = props.startPeriod;
    this._endPeriod = props.endPeriod;
    this._type = props.type;
    this._totalPlannedValue = props.totalPlannedValue;
    this._isActive = props.isActive ?? true;
    this._status = props.status ?? 'active';
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get startPeriod(): Date { return this._startPeriod; }
  get endPeriod(): Date { return this._endPeriod; }
  get type(): BudgetType { return this._type; }
  get totalPlannedValue(): Money { return this._totalPlannedValue; }
  get isActive(): boolean { return this._isActive; }
  get status(): BudgetStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateName();
    this.validateType();
    this.validateStatus();
    this.validatePeriods();
    this.validateTotalPlannedValue();
  }

  private validateName(): void {
    if (!this._name || this._name.trim() === '') {
      throw new Error('Budget name cannot be empty');
    }
  }

  private validateType(): void {
    const validTypes: BudgetType[] = ['manual'];
    if (!validTypes.includes(this._type)) {
      throw new Error(`Invalid budget type: ${this._type}`);
    }
  }

  private validateStatus(): void {
    const validStatuses: BudgetStatus[] = ['active', 'inactive', 'expired'];
    if (!validStatuses.includes(this._status)) {
      throw new Error(`Invalid budget status: ${this._status}`);
    }
  }

  private validatePeriods(): void {
    if (this._endPeriod < this._startPeriod) {
      throw new Error('End period cannot be before start period');
    }
  }

  private validateTotalPlannedValue(): void {
    if (this._totalPlannedValue.value < 0) {
      throw new Error('Total planned value cannot be negative');
    }
  }

  // Business methods
  deactivate(): Budget {
    return new Budget({
      ...this.getProps(),
      isActive: false,
      status: 'inactive'
    });
  }

  activate(): Budget {
    return new Budget({
      ...this.getProps(),
      isActive: true,
      status: 'active'
    });
  }

  updateName(newName: string): Budget {
    if (!newName || newName.trim() === '') {
      throw new Error('Budget name cannot be empty');
    }

    return new Budget({
      ...this.getProps(),
      name: newName.trim()
    });
  }

  updateTotalPlannedValue(newValue: Money): Budget {
    if (newValue.value < 0) {
      throw new Error('Total planned value cannot be negative');
    }

    return new Budget({
      ...this.getProps(),
      totalPlannedValue: newValue
    });
  }

  getDurationInDays(): number {
    const timeDiff = this._endPeriod.getTime() - this._startPeriod.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Helper method to get all props (for immutability)
  private getProps(): BudgetProps {
    return {
      id: this._id,
      userId: this._userId,
      name: this._name,
      startPeriod: this._startPeriod,
      endPeriod: this._endPeriod,
      type: this._type,
      totalPlannedValue: this._totalPlannedValue,
      isActive: this._isActive,
      status: this._status,
      createdAt: this._createdAt
    };
  }
}
