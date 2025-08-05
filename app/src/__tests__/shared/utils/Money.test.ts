// Tests for Money value object
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Money', () => {
  describe('constructor', () => {
    it('should create money with valid amount and currency', () => {
      const money = new Money(100.50, 'BRL');
      
      expect(money.value).toBe(100.50);
      expect(money.currency).toBe('BRL');
    });

    it('should use BRL as default currency', () => {
      const money = new Money(100);
      
      expect(money.currency).toBe('BRL');
    });

    it('should convert currency to uppercase', () => {
      const money = new Money(100, 'usd');
      
      expect(money.currency).toBe('USD');
    });

    it('should not round amount automatically', () => {
      const money = new Money(100.567);
      
      expect(money.value).toBe(100.567);
    });
  });

  describe('validation', () => {
    it('should throw error for negative amount', () => {
      expect(() => new Money(-100)).toThrow('Amount cannot be negative');
    });

    it('should throw error for NaN amount', () => {
      expect(() => new Money(NaN)).toThrow('Amount must be a valid number');
    });

    it('should throw error for invalid currency length', () => {
      expect(() => new Money(100, 'BR')).toThrow('Currency must be a 3-letter code');
      expect(() => new Money(100, 'BRLR')).toThrow('Currency must be a 3-letter code');
    });

    it('should throw error for empty currency', () => {
      expect(() => new Money(100, '')).toThrow('Currency must be a valid string');
    });
  });

  describe('mathematical operations', () => {
    it('should add money correctly', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'BRL');
      const result = money1.add(money2);
      
      expect(result.value).toBe(150);
      expect(result.currency).toBe('BRL');
    });

    it('should subtract money correctly', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(30, 'BRL');
      const result = money1.subtract(money2);
      
      expect(result.value).toBe(70);
      expect(result.currency).toBe('BRL');
    });

    it('should multiply money correctly', () => {
      const money = new Money(100, 'BRL');
      const result = money.multiply(2.5);
      
      expect(result.value).toBe(250);
      expect(result.currency).toBe('BRL');
    });

    it('should throw error when subtracting more than available', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(150, 'BRL');
      
      expect(() => money1.subtract(money2)).toThrow('Cannot subtract more than available amount');
    });

    it('should throw error when multiplying by negative factor', () => {
      const money = new Money(100, 'BRL');
      
      expect(() => money.multiply(-2)).toThrow('Multiplication factor cannot be negative');
    });

    it('should throw error for currency mismatch in operations', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');
      
      expect(() => money1.add(money2)).toThrow('Currency mismatch: BRL vs USD');
      expect(() => money1.subtract(money2)).toThrow('Currency mismatch: BRL vs USD');
    });
  });

  describe('comparisons', () => {
    it('should compare money correctly', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'BRL');
      const money3 = new Money(100, 'BRL');
      
      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(true);
      expect(money1.equals(money3)).toBe(true);
    });

    it('should check if money is zero', () => {
      const zeroMoney = new Money(0, 'BRL');
      const nonZeroMoney = new Money(100, 'BRL');
      
      expect(zeroMoney.isZero()).toBe(true);
      expect(nonZeroMoney.isZero()).toBe(false);
    });
  });

  describe('formatting', () => {
    it('should format money correctly for BRL', () => {
      const money = new Money(1234.56, 'BRL');
      const formatted = money.format();
      
      expect(formatted).toMatch(/R\$\s*1\.234,56/);
    });

    it('should format zero money correctly', () => {
      const money = new Money(0, 'BRL');
      const formatted = money.format();
      
      expect(formatted).toMatch(/R\$\s*0,00/);
    });
  });

  describe('factory methods', () => {
    it('should create zero money', () => {
      const zeroMoney = Money.zero('USD');
      
      expect(zeroMoney.value).toBe(0);
      expect(zeroMoney.currency).toBe('USD');
    });

    it('should create money from string', () => {
      const money = Money.fromString('1234.56', 'BRL');
      
      expect(money.value).toBe(1234.56);
      expect(money.currency).toBe('BRL');
    });

    it('should throw error for invalid string format', () => {
      expect(() => Money.fromString('invalid', 'BRL')).toThrow('Invalid money string format');
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const money = new Money(100.50, 'BRL');
      const json = money.toJSON();
      
      expect(json).toBe(100.50);
    });

    it('should convert to string correctly', () => {
      const money = new Money(100.50, 'BRL');
      const string = money.toString();
      
      expect(string).toBe('100.5 BRL');
    });
  });

  describe('equals', () => {
    it('should return true for same amount and currency', () => {
      const money1 = new Money(100.50, 'BRL');
      const money2 = new Money(100.50, 'BRL');
      
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(200, 'BRL');
      
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(100, 'USD');
      
      expect(money1.equals(money2)).toBe(false);
    });
  });
}); 