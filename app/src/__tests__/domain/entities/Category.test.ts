// Tests for Category Entity
import { Category } from '../../../clean-architecture/domain/entities/Category';

describe('Category Entity', () => {
  describe('constructor', () => {
    it('should create category with valid data', () => {
      const category = new Category({
        id: 'category-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false,
        createdAt: new Date('2024-01-15')
      });

      expect(category.id).toBe('category-1');
      expect(category.name).toBe('Alimentação');
      expect(category.type).toBe('expense');
      expect(category.isDefault).toBe(false);
      expect(category.createdAt).toEqual(new Date('2024-01-15'));
    });

    it('should create category with minimal required data', () => {
      const category = new Category({
        id: 'category-2',
        name: 'Vendas',
        type: 'income'
      });

      expect(category.id).toBe('category-2');
      expect(category.name).toBe('Vendas');
      expect(category.type).toBe('income');
      expect(category.isDefault).toBe(false); // default value
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => {
        new Category({
          id: 'category-1',
          name: '',
          type: 'expense'
        });
      }).toThrow('Category name cannot be empty');
    });

    it('should throw error for invalid category type', () => {
      expect(() => {
        new Category({
          id: 'category-1',
          name: 'Test Category',
          type: 'invalid' as any
        });
      }).toThrow('Invalid category type: invalid');
    });
  });

  describe('business methods', () => {
    it('should check if category is for income', () => {
      const incomeCategory = new Category({
        id: 'category-1',
        name: 'Vendas',
        type: 'income'
      });

      const expenseCategory = new Category({
        id: 'category-2',
        name: 'Alimentação',
        type: 'expense'
      });

      expect(incomeCategory.isIncome()).toBe(true);
      expect(expenseCategory.isIncome()).toBe(false);
    });

    it('should check if category is for expense', () => {
      const incomeCategory = new Category({
        id: 'category-1',
        name: 'Vendas',
        type: 'income'
      });

      const expenseCategory = new Category({
        id: 'category-2',
        name: 'Alimentação',
        type: 'expense'
      });

      expect(expenseCategory.isExpense()).toBe(true);
      expect(incomeCategory.isExpense()).toBe(false);
    });

    it('should check if category is default', () => {
      const defaultCategory = new Category({
        id: 'category-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true
      });

      const customCategory = new Category({
        id: 'category-2',
        name: 'Vendas',
        type: 'income',
        isDefault: false
      });

      expect(defaultCategory.isDefault).toBe(true);
      expect(customCategory.isDefault).toBe(false);
    });
  });

  describe('category types', () => {
    it('should validate all category types', () => {
      const validTypes = ['income', 'expense'];

      validTypes.forEach(type => {
        expect(() => {
          new Category({
            id: `category-${type}`,
            name: `Category ${type}`,
            type: type as any
          });
        }).not.toThrow();
      });
    });
  });

  describe('equality', () => {
    it('should compare categories by id', () => {
      const category1 = new Category({
        id: 'category-1',
        name: 'Category 1',
        type: 'expense'
      });

      const category2 = new Category({
        id: 'category-1',
        name: 'Category 2',
        type: 'income'
      });

      const category3 = new Category({
        id: 'category-3',
        name: 'Category 3',
        type: 'expense'
      });

      expect(category1.equals(category2)).toBe(true);
      expect(category1.equals(category3)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize category to JSON', () => {
      const category = new Category({
        id: 'category-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true,
        createdAt: new Date('2024-01-15')
      });

      const json = category.toJSON();

      expect(json).toEqual({
        id: 'category-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true,
        createdAt: '2024-01-15T00:00:00.000Z'
      });
    });
  });
}); 