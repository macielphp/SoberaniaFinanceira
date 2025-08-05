// Tests for ValueObject base class
import { ValueObject } from '../../../clean-architecture/shared/utils/ValueObject';

// Concrete implementation for testing
class TestValueObject extends ValueObject<string> {
  protected validate(): void {
    if (!this._value || this._value.length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}

describe('ValueObject', () => {
  describe('constructor', () => {
    it('should create value object with valid value', () => {
      const value = 'test';
      const vo = new TestValueObject(value);
      
      expect(vo.value).toBe(value);
    });

    it('should call validate method during construction', () => {
      expect(() => new TestValueObject('')).toThrow('Value cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for same value objects', () => {
      const vo1 = new TestValueObject('test');
      const vo2 = new TestValueObject('test');
      
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different value objects', () => {
      const vo1 = new TestValueObject('test1');
      const vo2 = new TestValueObject('test2');
      
      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for null', () => {
      const vo = new TestValueObject('test');
      
      expect(vo.equals(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      const vo = new TestValueObject('test');
      
      expect(vo.equals(undefined as any)).toBe(false);
    });

    it('should return false for different types', () => {
      const vo = new TestValueObject('test');
      const otherVo = new (class extends ValueObject<number> {
        protected validate(): void {}
      })(123);
      
      expect(vo.equals(otherVo as any)).toBe(false);
    });
  });

  describe('hashCode', () => {
    it('should return same hash for same values', () => {
      const vo1 = new TestValueObject('test');
      const vo2 = new TestValueObject('test');
      
      expect(vo1.hashCode()).toBe(vo2.hashCode());
    });

    it('should return different hash for different values', () => {
      const vo1 = new TestValueObject('test1');
      const vo2 = new TestValueObject('test2');
      
      expect(vo1.hashCode()).not.toBe(vo2.hashCode());
    });
  });

  describe('toString', () => {
    it('should return string representation of value', () => {
      const value = 'test';
      const vo = new TestValueObject(value);
      
      expect(vo.toString()).toBe(value);
    });
  });

  describe('toJSON', () => {
    it('should return the value for JSON serialization', () => {
      const value = 'test';
      const vo = new TestValueObject(value);
      
      expect(vo.toJSON()).toBe(value);
    });
  });

  describe('clone', () => {
    it('should create a new instance with same value', () => {
      const original = new TestValueObject('test');
      const cloned = original.clone();
      
      expect(cloned).not.toBe(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned.equals(original)).toBe(true);
    });
  });
}); 