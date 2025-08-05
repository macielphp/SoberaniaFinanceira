// Base Value Object Class
// Classe base para todos os Value Objects da aplicação

export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
    this.validate();
  }

  // Método abstrato que deve ser implementado pelos filhos
  protected abstract validate(): void;

  // Getter para o valor
  get value(): T {
    return this._value;
  }

  // Comparação de igualdade
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    
    if (this.constructor !== other.constructor) {
      return false;
    }

    return this._value === other._value;
  }

  // Hash code para comparações
  hashCode(): number {
    return JSON.stringify(this._value).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  // String representation
  toString(): string {
    return String(this._value);
  }

  // JSON serialization
  toJSON(): T {
    return this._value;
  }

  // Clone
  clone(): ValueObject<T> {
    return new (this.constructor as any)(this._value);
  }
} 