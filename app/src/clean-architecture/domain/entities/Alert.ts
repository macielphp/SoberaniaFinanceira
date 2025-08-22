import { Money } from '../../shared/utils/Money';

export type AlertType = 'low_balance' | 'negative_balance' | 'credit_limit';
export type AlertSeverity = 'warning' | 'error';

export interface AlertProps {
  id: string;
  accountId: string;
  accountName: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  value: Money;
  threshold: Money;
  isDismissed?: boolean;
  createdAt?: Date;
  dismissedAt?: Date;
}

export class Alert {
  private readonly _id: string;
  private readonly _accountId: string;
  private readonly _accountName: string;
  private readonly _type: AlertType;
  private readonly _message: string;
  private readonly _severity: AlertSeverity;
  private readonly _value: Money;
  private readonly _threshold: Money;
  private readonly _isDismissed: boolean;
  private readonly _createdAt: Date;
  private readonly _dismissedAt?: Date;

  constructor(props: AlertProps) {
    this.validateAlertType(props.type);
    this.validateAlertSeverity(props.severity);
    this.validateMessage(props.message);
    this.validateAccountName(props.accountName);

    this._id = props.id;
    this._accountId = props.accountId;
    this._accountName = props.accountName;
    this._type = props.type;
    this._message = props.message;
    this._severity = props.severity;
    this._value = props.value;
    this._threshold = props.threshold;
    this._isDismissed = props.isDismissed ?? false;
    this._createdAt = props.createdAt ?? new Date();
    this._dismissedAt = props.dismissedAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get accountName(): string {
    return this._accountName;
  }

  get type(): AlertType {
    return this._type;
  }

  get message(): string {
    return this._message;
  }

  get severity(): AlertSeverity {
    return this._severity;
  }

  get value(): Money {
    return this._value;
  }

  get threshold(): Money {
    return this._threshold;
  }

  get isDismissed(): boolean {
    return this._isDismissed;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get dismissedAt(): Date | undefined {
    return this._dismissedAt;
  }

  // Business Logic Methods
  isActive(): boolean {
    return !this._isDismissed;
  }

  isCritical(): boolean {
    return this._severity === 'error';
  }

  dismiss(): Alert {
    if (this._isDismissed) {
      throw new Error('Alert is already dismissed');
    }

    return new Alert({
      id: this._id,
      accountId: this._accountId,
      accountName: this._accountName,
      type: this._type,
      message: this._message,
      severity: this._severity,
      value: this._value,
      threshold: this._threshold,
      isDismissed: true,
      createdAt: this._createdAt,
      dismissedAt: new Date()
    });
  }

  getFormattedMessage(): string {
    return `${this._message} - Valor: ${this._value.format()}`;
  }

  getIcon(): string {
    switch (this._type) {
      case 'low_balance':
        return '⚠️';
      case 'negative_balance':
        return '🚨';
      case 'credit_limit':
        return '💳';
      default:
        return '⚠️';
    }
  }

  getColor(): string {
    switch (this._severity) {
      case 'warning':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#FF9800';
    }
  }

  // Private validation methods
  private validateAlertType(type: string): void {
    const validTypes: AlertType[] = ['low_balance', 'negative_balance', 'credit_limit'];
    if (!validTypes.includes(type as AlertType)) {
      throw new Error('Invalid alert type');
    }
  }

  private validateAlertSeverity(severity: string): void {
    const validSeverities: AlertSeverity[] = ['warning', 'error'];
    if (!validSeverities.includes(severity as AlertSeverity)) {
      throw new Error('Invalid alert severity');
    }
  }

  private validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new Error('Alert message cannot be empty');
    }
  }

  private validateAccountName(accountName: string): void {
    if (!accountName || accountName.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }
  }

  // Utility method to get all properties for creating a new instance
  private get allProps(): AlertProps {
    return {
      id: this._id,
      accountId: this._accountId,
      accountName: this._accountName,
      type: this._type,
      message: this._message,
      severity: this._severity,
      value: this._value,
      threshold: this._threshold,
      isDismissed: this._isDismissed,
      createdAt: this._createdAt,
      dismissedAt: this._dismissedAt
    };
  }
}
