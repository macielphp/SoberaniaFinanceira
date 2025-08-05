// Tests for Result pattern
import { Result, Success, Failure, success, failure, isSuccess, isFailure } from '../../../clean-architecture/shared/utils/Result';

describe('Result Pattern', () => {
  describe('Success', () => {
    it('should create success result', () => {
      const result = new Success<string, Error>('test');
      
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result._value).toBe('test');
    });

    it('should map success value', () => {
      const result = new Success<number, Error>(10);
      const mapped = result.map(x => x * 2);
      
      expect(mapped.isSuccess()).toBe(true);
      expect((mapped as Success<number, Error>)._value).toBe(20);
    });

    it('should flatMap success value', () => {
      const result = new Success<number, Error>(10);
      const flatMapped = result.flatMap(x => new Success<number, Error>(x * 2));
      
      expect(flatMapped.isSuccess()).toBe(true);
      expect((flatMapped as Success<number, Error>)._value).toBe(20);
    });

    it('should return value for getOrElse', () => {
      const result = new Success<string, Error>('test');
      const value = result.getOrElse('default');
      
      expect(value).toBe('test');
    });

    it('should return value for getOrThrow', () => {
      const result = new Success<string, Error>('test');
      const value = result.getOrThrow();
      
      expect(value).toBe('test');
    });

    it('should call success handler in match', () => {
      const result = new Success<string, Error>('test');
      const matched = result.match(
        value => `success: ${value}`,
        error => `error: ${error}`
      );
      
      expect(matched).toBe('success: test');
    });
  });

  describe('Failure', () => {
    it('should create failure result', () => {
      const error = new Error('test error');
      const result = new Failure<string, Error>(error);
      
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result._error).toBe(error);
    });

    it('should not map failure value', () => {
      const error = new Error('test error');
      const result = new Failure<number, Error>(error);
      const mapped = result.map((x: number) => x * 2);
      
      expect(mapped.isFailure()).toBe(true);
      expect((mapped as Failure<number, Error>)._error).toBe(error);
    });

    it('should not flatMap failure value', () => {
      const error = new Error('test error');
      const result = new Failure<number, Error>(error);
      const flatMapped = result.flatMap((x: number) => new Success<number, Error>(x * 2));
      
      expect(flatMapped.isFailure()).toBe(true);
      expect((flatMapped as Failure<number, Error>)._error).toBe(error);
    });

    it('should return default value for getOrElse', () => {
      const error = new Error('test error');
      const result = new Failure<string, Error>(error);
      const value = result.getOrElse('default');
      
      expect(value).toBe('default');
    });

    it('should throw error for getOrThrow', () => {
      const error = new Error('test error');
      const result = new Failure<string, Error>(error);
      
      expect(() => result.getOrThrow()).toThrow('test error');
    });

    it('should call failure handler in match', () => {
      const error = new Error('test error');
      const result = new Failure<string, Error>(error);
      const matched = result.match(
        value => `success: ${value}`,
        error => `error: ${error.message}`
      );
      
      expect(matched).toBe('error: test error');
    });
  });

  describe('Factory functions', () => {
    it('should create success with factory function', () => {
      const result = success<string, Error>('test');
      
      expect(result.isSuccess()).toBe(true);
      expect((result as Success<string, Error>)._value).toBe('test');
    });

    it('should create failure with factory function', () => {
      const error = new Error('test error');
      const result = failure<string, Error>(error);
      
      expect(result.isFailure()).toBe(true);
      expect((result as Failure<string, Error>)._error).toBe(error);
    });
  });

  describe('Utility functions', () => {
    it('should identify success result', () => {
      const successResult = success<string, Error>('test');
      const failureResult = failure<string, Error>(new Error('test'));
      
      expect(isSuccess(successResult)).toBe(true);
      expect(isSuccess(failureResult)).toBe(false);
    });

    it('should identify failure result', () => {
      const successResult = success<string, Error>('test');
      const failureResult = failure<string, Error>(new Error('test'));
      
      expect(isFailure(failureResult)).toBe(true);
      expect(isFailure(successResult)).toBe(false);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety through operations', () => {
      const result: Result<number, Error> = success<number, Error>(10);
      
      if (isSuccess(result)) {
        expect(result._value).toBe(10);
        expect(typeof result._value).toBe('number');
      }
    });

    it('should handle different error types', () => {
      const stringError: Result<string, string> = failure<string, string>('string error');
      const objectError: Result<string, Error> = failure<string, Error>(new Error('object error'));
      
      expect(isFailure(stringError)).toBe(true);
      expect(isFailure(objectError)).toBe(true);
    });
  });

  describe('Chaining operations', () => {
    it('should chain map operations', () => {
      const result = success<number, Error>(5)
        .map(x => x * 2)
        .map(x => x + 1);
      
      expect(result.isSuccess()).toBe(true);
      expect((result as Success<number, Error>)._value).toBe(11);
    });

    it('should chain flatMap operations', () => {
      const result = success<number, Error>(5)
        .flatMap(x => success<number, Error>(x * 2))
        .flatMap(x => success<number, Error>(x + 1));
      
      expect(result.isSuccess()).toBe(true);
      expect((result as Success<number, Error>)._value).toBe(11);
    });

    it('should stop chaining on failure', () => {
      const error = new Error('test error');
      const result = success<number, Error>(5)
        .flatMap(x => failure<number, Error>(error))
        .map(x => x * 2);
      
      expect(result.isFailure()).toBe(true);
      expect((result as Failure<number, Error>)._error).toBe(error);
    });
  });

  describe('Error handling patterns', () => {
    it('should handle errors gracefully with match', () => {
      const successResult = success<string, Error>('data');
      const failureResult = failure<string, Error>(new Error('error'));
      
      const successHandled = successResult.match(
        data => `Processed: ${data}`,
        error => `Error: ${error.message}`
      );
      
      const failureHandled = failureResult.match(
        data => `Processed: ${data}`,
        error => `Error: ${error.message}`
      );
      
      expect(successHandled).toBe('Processed: data');
      expect(failureHandled).toBe('Error: error');
    });

    it('should provide fallback values with getOrElse', () => {
      const failureResult = failure<string, Error>(new Error('error'));
      const fallbackValue = failureResult.getOrElse('default');
      
      expect(fallbackValue).toBe('default');
    });
  });
}); 