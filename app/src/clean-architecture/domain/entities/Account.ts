// Domain Entity: Account
// Representa uma conta bancária no sistema

import { Money } from '../../shared/utils/Money';

// Types for Account
export type AccountType = 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'dinheiro';

// Interface for Account constructor
export interface AccountProps {
  id: string;
  name: string;
  type: AccountType;
  balance: Money;
  isActive?: boolean;
  isDefault?: boolean;
  description?: string;
  color?: string;
  createdAt?: Date;
}

export class Account {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _type: AccountType;
  private readonly _balance: Money;
  private readonly _isActive: boolean;
  private readonly _isDefault: boolean;
  private readonly _description?: string;
  private readonly _color?: string;
  private readonly _createdAt: Date;

  constructor(props: AccountProps) {
    this._id = props.id;
    this._name = props.name;
    this._type = props.type;
    this._balance = props.balance;
    this._isActive = props.isActive ?? true;
    this._isDefault = props.isDefault ?? false;
    this._description = props.description;
    this._color = props.color;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get type(): AccountType { return this._type; }
  get balance(): Money { return this._balance; }
  get isActive(): boolean { return this._isActive; }
  get description(): string | undefined { return this._description; }
  get isDefault(): boolean { return this._isDefault; }
  get color(): string | undefined { return this._color; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateName();
    this.validateType();
    this.validateBalance();
  }

  private validateName(): void {
    if (!this._name || this._name.trim() === '') {
      throw new Error('Account name cannot be empty');
    }
  }

  private validateType(): void {
    const validTypes: AccountType[] = ['corrente', 'poupanca', 'investimento', 'cartao_credito', 'dinheiro'];
    if (!validTypes.includes(this._type)) {
      throw new Error(`Invalid account type: ${this._type}`);
    }
  }

  private validateBalance(): void {
    if (this._balance.value < 0) {
      throw new Error('Account balance cannot be negative');
    }
  }

  // Business methods
  hasSufficientBalance(amount: Money): boolean {
    return this._balance.value >= amount.value;
  }

  addMoney(amount: Money): Account {
    const newBalance = this._balance.add(amount);
    return new Account({
      ...this.getProps(),
      balance: newBalance
    });
  }

  subtractMoney(amount: Money): Account {
    if (!this.hasSufficientBalance(amount)) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = this._balance.subtract(amount);
    return new Account({
      ...this.getProps(),
      balance: newBalance
    });
  }

  isEmpty(): boolean {
    return this._balance.isZero();
  }

  isCreditCard(): boolean {
    return this._type === 'cartao_credito';
  }

  isCash(): boolean {
    return this._type === 'dinheiro';
  }

  // Utility methods
  private getProps(): Omit<AccountProps, 'balance'> {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      isActive: this._isActive,
      description: this._description,
      color: this._color,
      createdAt: this._createdAt
    };
  }

  // Equality
  equals(other: Account): boolean {
    return this._id === other._id;
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      balance: this._balance.value,
      isActive: this._isActive,
      description: this._description,
      color: this._color,
      createdAt: this._createdAt.toISOString()
    };
  }
} 