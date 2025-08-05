// Result Pattern
// Padrão para tratamento de resultados e erros de forma funcional

export type Result<T, E = Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
  readonly _tag: 'Success' = 'Success';
  readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  isSuccess(): this is Success<T, E> {
    return true;
  }

  isFailure(): this is Failure<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Success(fn(this._value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this._value);
  }

  getOrElse(defaultValue: T): T {
    return this._value;
  }

  getOrThrow(): T {
    return this._value;
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return onSuccess(this._value);
  }
}

export class Failure<T, E> {
  readonly _tag: 'Failure' = 'Failure';
  readonly _error: E;

  constructor(error: E) {
    this._error = error;
  }

  isSuccess(): this is Success<T, E> {
    return false;
  }

  isFailure(): this is Failure<T, E> {
    return true;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Failure(this._error);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Failure(this._error);
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  getOrThrow(): T {
    throw this._error;
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return onFailure(this._error);
  }
}

// Factory functions
export const success = <T, E>(value: T): Result<T, E> => new Success(value);
export const failure = <T, E>(error: E): Result<T, E> => new Failure(error);

// Utility functions
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T, E> => {
  return result.isSuccess();
};

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<T, E> => {
  return result.isFailure();
}; 