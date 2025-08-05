// Domain Entity: Goal
// Representa uma meta financeira no sistema

import { Money } from '../../shared/utils/Money';

// Types for Goal
export type GoalType = 'economia' | 'compra';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalImportance = 'baixa' | 'média' | 'alta';

// Interface for Goal constructor
export interface GoalProps {
  id: string;
  userId: string;
  description: string;
  type: GoalType;
  targetValue: Money;
  startDate: Date;
  endDate: Date;
  monthlyIncome: Money;
  fixedExpenses: Money;
  availablePerMonth: Money;
  importance: GoalImportance;
  priority: number;
  strategy?: string;
  monthlyContribution: Money;
  numParcela: number;
  status?: GoalStatus;
  createdAt?: Date;
}

export class Goal {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _description: string;
  private readonly _type: GoalType;
  private readonly _targetValue: Money;
  private readonly _startDate: Date;
  private readonly _endDate: Date;
  private readonly _monthlyIncome: Money;
  private readonly _fixedExpenses: Money;
  private readonly _availablePerMonth: Money;
  private readonly _importance: GoalImportance;
  private readonly _priority: number;
  private readonly _strategy?: string;
  private readonly _monthlyContribution: Money;
  private readonly _numParcela: number;
  private readonly _status: GoalStatus;
  private readonly _createdAt: Date;

  constructor(props: GoalProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._description = props.description;
    this._type = props.type;
    this._targetValue = props.targetValue;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._monthlyIncome = props.monthlyIncome;
    this._fixedExpenses = props.fixedExpenses;
    this._availablePerMonth = props.availablePerMonth;
    this._importance = props.importance;
    this._priority = props.priority;
    this._strategy = props.strategy;
    this._monthlyContribution = props.monthlyContribution;
    this._numParcela = props.numParcela;
    this._status = props.status || 'active';
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get description(): string { return this._description; }
  get type(): GoalType { return this._type; }
  get targetValue(): Money { return this._targetValue; }
  get startDate(): Date { return this._startDate; }
  get endDate(): Date { return this._endDate; }
  get monthlyIncome(): Money { return this._monthlyIncome; }
  get fixedExpenses(): Money { return this._fixedExpenses; }
  get availablePerMonth(): Money { return this._availablePerMonth; }
  get importance(): GoalImportance { return this._importance; }
  get priority(): number { return this._priority; }
  get strategy(): string | undefined { return this._strategy; }
  get monthlyContribution(): Money { return this._monthlyContribution; }
  get numParcela(): number { return this._numParcela; }
  get status(): GoalStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateDescription();
    this.validateType();
    this.validatePriority();
    this.validateDates();
  }

  private validateDescription(): void {
    if (!this._description || this._description.trim() === '') {
      throw new Error('Goal description cannot be empty');
    }
  }

  private validateType(): void {
    const validTypes: GoalType[] = ['economia', 'compra'];
    if (!validTypes.includes(this._type)) {
      throw new Error(`Invalid goal type: ${this._type}`);
    }
  }

  private validatePriority(): void {
    if (this._priority < 1 || this._priority > 5) {
      throw new Error('Priority must be between 1 and 5');
    }
  }

  private validateDates(): void {
    if (this._endDate <= this._startDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Business methods
  isEconomy(): boolean {
    return this._type === 'economia';
  }

  isPurchase(): boolean {
    return this._type === 'compra';
  }

  isActive(): boolean {
    return this._status === 'active';
  }

  isCompleted(): boolean {
    return this._status === 'completed';
  }

  isPaused(): boolean {
    return this._status === 'paused';
  }

  isCancelled(): boolean {
    return this._status === 'cancelled';
  }

  getTotalContributionNeeded(): Money {
    return this._monthlyContribution.multiply(this._numParcela);
  }

  getProgressPercentage(currentValue: Money): number {
    if (this._targetValue.isZero()) {
      return 0;
    }
    return Math.min((currentValue.value / this._targetValue.value) * 100, 100);
  }

  getRemainingAmount(currentValue: Money): Money {
    const remaining = this._targetValue.value - currentValue.value;
    return new Money(Math.max(0, remaining), this._targetValue.currency);
  }

  // State transitions
  markAsCompleted(): Goal {
    return new Goal({
      ...this.getProps(),
      status: 'completed'
    });
  }

  markAsPaused(): Goal {
    return new Goal({
      ...this.getProps(),
      status: 'paused'
    });
  }

  markAsCancelled(): Goal {
    return new Goal({
      ...this.getProps(),
      status: 'cancelled'
    });
  }

  reactivate(): Goal {
    return new Goal({
      ...this.getProps(),
      status: 'active'
    });
  }

  // Utility methods
  private getProps(): Omit<GoalProps, 'status'> {
    return {
      id: this._id,
      userId: this._userId,
      description: this._description,
      type: this._type,
      targetValue: this._targetValue,
      startDate: this._startDate,
      endDate: this._endDate,
      monthlyIncome: this._monthlyIncome,
      fixedExpenses: this._fixedExpenses,
      availablePerMonth: this._availablePerMonth,
      importance: this._importance,
      priority: this._priority,
      strategy: this._strategy,
      monthlyContribution: this._monthlyContribution,
      numParcela: this._numParcela,
      createdAt: this._createdAt
    };
  }

  // Equality
  equals(other: Goal): boolean {
    return this._id === other._id;
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id,
      userId: this._userId,
      description: this._description,
      type: this._type,
      targetValue: this._targetValue.value,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      monthlyIncome: this._monthlyIncome.value,
      fixedExpenses: this._fixedExpenses.value,
      availablePerMonth: this._availablePerMonth.value,
      importance: this._importance,
      priority: this._priority,
      strategy: this._strategy,
      monthlyContribution: this._monthlyContribution.value,
      numParcela: this._numParcela,
      status: this._status,
      createdAt: this._createdAt.toISOString()
    };
  }
} 