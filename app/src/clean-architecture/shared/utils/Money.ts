// Value Object: Money
// Representa valores monetários de forma imutável e segura

import { ValueObject } from './ValueObject';

export class Money extends ValueObject<number> {
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'BRL') {
    super(amount);
    this._currency = currency.toUpperCase();
    this.validateCurrency();
  }

  protected validate(): void {
    if (typeof this._value !== 'number' || isNaN(this._value)) {
      throw new Error('Amount must be a valid number');
    }
    
    if (this._value < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  private validateCurrency(): void {
    if (!this._currency || typeof this._currency !== 'string') {
      throw new Error('Currency must be a valid string');
    }
    
    if (this._currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code (e.g., BRL, USD)');
    }
  }

  get currency(): string {
    return this._currency;
  }

  // Operações matemáticas
  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this._value + other._value, this._currency);
  }

  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    const result = this._value - other._value;
    if (result < 0) {
      throw new Error('Cannot subtract more than available amount');
    }
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative');
    }
    return new Money(this._value * factor, this._currency);
  }

  // Comparações
  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this._value > other._value;
  }

  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this._value < other._value;
  }

  isZero(): boolean {
    return this._value === 0;
  }

  // Validação de mesma moeda
  private validateSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }

  // Formatação
  format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this._currency
    }).format(this._value);
  }

  // Factory methods
  static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency);
  }

  static fromString(value: string, currency: string = 'BRL'): Money {
    const amount = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Invalid money string format');
    }
    return new Money(amount, currency);
  }

  // Override equals para incluir currency
  equals(other: Money): boolean {
    return super.equals(other) && this._currency === other._currency;
  }

  // Override toString
  toString(): string {
    return `${this._value} ${this._currency}`;
  }
} 