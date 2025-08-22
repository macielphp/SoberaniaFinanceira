// Domain Entity: MonthlyFinanceSummary
// Representa o resumo financeiro mensal do usuário

import { Money } from '../../shared/utils/Money';

// Interface for MonthlyFinanceSummary constructor
export interface MonthlyFinanceSummaryProps {
  id: string;
  userId: string;
  month: string; // YYYY-MM format
  totalIncome: Money;
  totalExpense: Money;
  balance: Money;
  totalPlannedBudget: Money;
  totalActualBudget: Money;
  createdAt?: Date;
}

export class MonthlyFinanceSummary {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _month: string;
  private readonly _totalIncome: Money;
  private readonly _totalExpense: Money;
  private readonly _balance: Money;
  private readonly _totalPlannedBudget: Money;
  private readonly _totalActualBudget: Money;
  private readonly _createdAt: Date;

  constructor(props: MonthlyFinanceSummaryProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._month = props.month;
    this._totalIncome = props.totalIncome;
    this._totalExpense = props.totalExpense;
    this._balance = props.balance;
    this._totalPlannedBudget = props.totalPlannedBudget;
    this._totalActualBudget = props.totalActualBudget;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get month(): string { return this._month; }
  get totalIncome(): Money { return this._totalIncome; }
  get totalExpense(): Money { return this._totalExpense; }
  get balance(): Money { return this._balance; }
  get totalPlannedBudget(): Money { return this._totalPlannedBudget; }
  get totalActualBudget(): Money { return this._totalActualBudget; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateMonth();
    this.validateValues();
  }

  private validateMonth(): void {
    if (!this._month || this._month.trim() === '') {
      throw new Error('Month cannot be empty');
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(this._month)) {
      throw new Error('Month must be in YYYY-MM format');
    }

    const [year, month] = this._month.split('-');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      throw new Error('Month must be between 01 and 12');
    }

    if (yearNum < 1900 || yearNum > 2100) {
      throw new Error('Year must be between 1900 and 2100');
    }
  }

  private validateValues(): void {
    // Money class already validates negative values
    // We need to ensure balance is calculated correctly
    // For negative balances, we'll use 0 as the minimum
    const expectedBalance = Math.max(0, this._totalIncome.value - this._totalExpense.value);
    if (Math.abs(this._balance.value - expectedBalance) > 0.01) {
      throw new Error('Balance must equal total income minus total expense (minimum 0)');
    }
  }

  // Business methods
  calculateSavingsRate(): number {
    if (this._totalIncome.value === 0) {
      return 0;
    }

    const savingsRate = (this._balance.value / this._totalIncome.value) * 100;
    return Math.round(savingsRate * 100) / 100; // Round to 2 decimal places
  }

  calculateBudgetAdherence(): number {
    if (this._totalPlannedBudget.value === 0) {
      return 0;
    }

    const adherence = (this._totalActualBudget.value / this._totalPlannedBudget.value) * 100;
    return Math.round(adherence * 100) / 100; // Round to 2 decimal places
  }

  isProfitable(): boolean {
    return this._totalIncome.value > this._totalExpense.value;
  }

  isBalanced(): boolean {
    return this._balance.value === 0;
  }

  updateTotalIncome(newIncome: Money): MonthlyFinanceSummary {
    const balanceValue = Math.max(0, newIncome.value - this._totalExpense.value);
    const newBalance = new Money(balanceValue, newIncome.currency);
    
    return new MonthlyFinanceSummary({
      ...this.getProps(),
      totalIncome: newIncome,
      balance: newBalance
    });
  }

  updateTotalExpense(newExpense: Money): MonthlyFinanceSummary {
    const balanceValue = Math.max(0, this._totalIncome.value - newExpense.value);
    const newBalance = new Money(balanceValue, newExpense.currency);
    
    return new MonthlyFinanceSummary({
      ...this.getProps(),
      totalExpense: newExpense,
      balance: newBalance
    });
  }

  updateBudgetValues(newPlannedBudget: Money, newActualBudget: Money): MonthlyFinanceSummary {
    return new MonthlyFinanceSummary({
      ...this.getProps(),
      totalPlannedBudget: newPlannedBudget,
      totalActualBudget: newActualBudget
    });
  }

  getMonthAndYear(): { month: number; year: number } {
    const [year, month] = this._month.split('-');
    return {
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    };
  }

  // Helper method to get all props (for immutability)
  private getProps(): MonthlyFinanceSummaryProps {
    return {
      id: this._id,
      userId: this._userId,
      month: this._month,
      totalIncome: this._totalIncome,
      totalExpense: this._totalExpense,
      balance: this._balance,
      totalPlannedBudget: this._totalPlannedBudget,
      totalActualBudget: this._totalActualBudget,
      createdAt: this._createdAt
    };
  }
}
