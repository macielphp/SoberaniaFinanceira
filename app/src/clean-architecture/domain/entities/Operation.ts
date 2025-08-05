// Domain Entity: Operation
// Representa uma operação financeira no sistema

import { Money } from '../../shared/utils/Money';

// Types for Operation
export type OperationNature = 'receita' | 'despesa';
export type OperationState = 'receber' | 'recebido' | 'pagar' | 'pago';
export type PaymentMethod = 
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'Pix'
  | 'TED'
  | 'Estorno'
  | 'Transferência bancária';

// Interface for Operation constructor
export interface OperationProps {
  id: string;
  nature: OperationNature;
  state: OperationState;
  paymentMethod: PaymentMethod;
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: Money;
  category: string;
  details?: string;
  project?: string;
  receipt?: Blob;
  createdAt?: Date;
}

export class Operation {
  private readonly _id: string;
  private readonly _nature: OperationNature;
  private readonly _state: OperationState;
  private readonly _paymentMethod: PaymentMethod;
  private readonly _sourceAccount: string;
  private readonly _destinationAccount: string;
  private readonly _date: Date;
  private readonly _value: Money;
  private readonly _category: string;
  private readonly _details?: string;
  private readonly _project?: string;
  private readonly _receipt?: Blob;
  private readonly _createdAt: Date;

  constructor(props: OperationProps) {
    this._id = props.id;
    this._nature = props.nature;
    this._state = props.state;
    this._paymentMethod = props.paymentMethod;
    this._sourceAccount = props.sourceAccount;
    this._destinationAccount = props.destinationAccount;
    this._date = props.date;
    this._value = props.value;
    this._category = props.category;
    this._details = props.details;
    this._project = props.project;
    this._receipt = props.receipt;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  // Getters
  get id(): string { return this._id; }
  get nature(): OperationNature { return this._nature; }
  get state(): OperationState { return this._state; }
  get paymentMethod(): PaymentMethod { return this._paymentMethod; }
  get sourceAccount(): string { return this._sourceAccount; }
  get destinationAccount(): string { return this._destinationAccount; }
  get date(): Date { return this._date; }
  get value(): Money { return this._value; }
  get category(): string { return this._category; }
  get details(): string | undefined { return this._details; }
  get project(): string | undefined { return this._project; }
  get receipt(): Blob | undefined { return this._receipt; }
  get createdAt(): Date { return this._createdAt; }

  // Validation
  private validate(): void {
    this.validateNature();
    this.validateState();
    this.validatePaymentMethod();
    this.validateAccounts();
    this.validateCategory();
    this.validateStateNatureCompatibility();
  }

  private validateNature(): void {
    const validNatures: OperationNature[] = ['receita', 'despesa'];
    if (!validNatures.includes(this._nature)) {
      throw new Error(`Invalid nature: ${this._nature}`);
    }
  }

  private validateState(): void {
    const validStates: OperationState[] = [
      'receber', 'recebido', 'pagar', 'pago'
    ];
    if (!validStates.includes(this._state)) {
      throw new Error(`Invalid state: ${this._state}`);
    }
  }

  private validatePaymentMethod(): void {
    const validPaymentMethods: PaymentMethod[] = [
      'Cartão de débito',
      'Cartão de crédito',
      'Pix',
      'TED',
      'Estorno',
      'Transferência bancária'
    ];
    if (!validPaymentMethods.includes(this._paymentMethod)) {
      throw new Error(`Invalid payment method: ${this._paymentMethod}`);
    }
  }

  private validateAccounts(): void {
    if (!this._sourceAccount || this._sourceAccount.trim() === '') {
      throw new Error('Source account cannot be empty');
    }
    if (!this._destinationAccount || this._destinationAccount.trim() === '') {
      throw new Error('Destination account cannot be empty');
    }
  }

  private validateCategory(): void {
    if (!this._category || this._category.trim() === '') {
      throw new Error('Category cannot be empty');
    }
  }

  private validateStateNatureCompatibility(): void {
    const validCombinations: Record<OperationNature, OperationState[]> = {
      receita: ['receber', 'recebido'],
      despesa: ['pagar', 'pago']
    };

    if (!validCombinations[this._nature].includes(this._state)) {
      throw new Error(`State "${this._state}" is not compatible with nature "${this._nature}"`);
    }
  }

  // Business methods
  isCompleted(): boolean {
    return ['recebido', 'pago'].includes(this._state);
  }

  isPending(): boolean {
    return ['receber', 'pagar'].includes(this._state);
  }

  isReceita(): boolean {
    return this._nature === 'receita';
  }

  isDespesa(): boolean {
    return this._nature === 'despesa';
  }

  // State transitions
  markAsCompleted(): Operation {
    const newState = this.getCompletedState();
    return new Operation({
      ...this.getProps(),
      state: newState
    });
  }

  markAsPending(): Operation {
    const newState = this.getPendingState();
    return new Operation({
      ...this.getProps(),
      state: newState
    });
  }

  private getCompletedState(): OperationState {
    const stateMap: Record<OperationState, OperationState> = {
      'receber': 'recebido',
      'recebido': 'recebido',
      'pagar': 'pago',
      'pago': 'pago'
    };
    return stateMap[this._state];
  }

  private getPendingState(): OperationState {
    const stateMap: Record<OperationState, OperationState> = {
      'receber': 'receber',
      'recebido': 'receber',
      'pagar': 'pagar',
      'pago': 'pagar'
    };
    return stateMap[this._state];
  }

  // Utility methods
  private getProps(): Omit<OperationProps, 'state'> {
    return {
      id: this._id,
      nature: this._nature,
      paymentMethod: this._paymentMethod,
      sourceAccount: this._sourceAccount,
      destinationAccount: this._destinationAccount,
      date: this._date,
      value: this._value,
      category: this._category,
      details: this._details,
      project: this._project,
      receipt: this._receipt,
      createdAt: this._createdAt
    };
  }

  // Equality
  equals(other: Operation): boolean {
    return this._id === other._id;
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id,
      nature: this._nature,
      state: this._state,
      paymentMethod: this._paymentMethod,
      sourceAccount: this._sourceAccount,
      destinationAccount: this._destinationAccount,
      date: this._date.toISOString(),
      value: this._value.toJSON(),
      category: this._category,
      details: this._details,
      project: this._project,
      createdAt: this._createdAt.toISOString()
    };
  }
} 