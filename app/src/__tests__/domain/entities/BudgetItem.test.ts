// Tests for BudgetItem Entity
import { BudgetItem } from '../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('BudgetItem Entity', () => {
  describe('constructor', () => {
    it('should create budget item with valid data', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      expect(budgetItem.id).toBe('item-123');
      expect(budgetItem.budgetId).toBe('budget-456');
      expect(budgetItem.categoryName).toBe('Alimentação');
      expect(budgetItem.plannedValue).toEqual(new Money(500, 'BRL'));
      expect(budgetItem.categoryType).toBe('expense');
      expect(budgetItem.actualValue).toEqual(new Money(450, 'BRL'));
    });

    it('should create budget item with minimal required data', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Transporte',
        plannedValue: new Money(300, 'BRL'),
        categoryType: 'expense'
      });

      expect(budgetItem.id).toBe('item-123');
      expect(budgetItem.budgetId).toBe('budget-456');
      expect(budgetItem.categoryName).toBe('Transporte');
      expect(budgetItem.plannedValue).toEqual(new Money(300, 'BRL'));
      expect(budgetItem.categoryType).toBe('expense');
      expect(budgetItem.actualValue).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should throw error for empty category name', () => {
      expect(() => {
        new BudgetItem({
          id: 'item-123',
          budgetId: 'budget-456',
          categoryName: '',
          plannedValue: new Money(500, 'BRL'),
          categoryType: 'expense'
        });
      }).toThrow('Category name cannot be empty');
    });

    it('should throw error for whitespace category name', () => {
      expect(() => {
        new BudgetItem({
          id: 'item-123',
          budgetId: 'budget-456',
          categoryName: '   ',
          plannedValue: new Money(500, 'BRL'),
          categoryType: 'expense'
        });
      }).toThrow('Category name cannot be empty');
    });

    it('should throw error for invalid category type', () => {
      expect(() => {
        new BudgetItem({
          id: 'item-123',
          budgetId: 'budget-456',
          categoryName: 'Alimentação',
          plannedValue: new Money(500, 'BRL'),
          categoryType: 'invalid' as any
        });
      }).toThrow('Invalid category type: invalid');
    });

    it('should throw error for negative planned value', () => {
      expect(() => {
        new BudgetItem({
          id: 'item-123',
          budgetId: 'budget-456',
          categoryName: 'Alimentação',
          plannedValue: new Money(-500, 'BRL'),
          categoryType: 'expense'
        });
      }).toThrow('Amount cannot be negative');
    });

    it('should throw error for negative actual value', () => {
      expect(() => {
        new BudgetItem({
          id: 'item-123',
          budgetId: 'budget-456',
          categoryName: 'Alimentação',
          plannedValue: new Money(500, 'BRL'),
          categoryType: 'expense',
          actualValue: new Money(-450, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });
  });

  describe('business methods', () => {
    it('should update planned value', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense'
      });

      const updatedItem = budgetItem.updatePlannedValue(new Money(600, 'BRL'));

      expect(updatedItem.plannedValue).toEqual(new Money(600, 'BRL'));
      expect(updatedItem.id).toBe(budgetItem.id);
    });

    it('should update actual value', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense'
      });

      const updatedItem = budgetItem.updateActualValue(new Money(450, 'BRL'));

      expect(updatedItem.actualValue).toEqual(new Money(450, 'BRL'));
      expect(updatedItem.id).toBe(budgetItem.id);
    });

    it('should clear actual value', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const updatedItem = budgetItem.clearActualValue();

      expect(updatedItem.actualValue).toBeUndefined();
      expect(updatedItem.id).toBe(budgetItem.id);
    });

    it('should calculate variance', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const variance = budgetItem.calculateVariance();

      expect(variance).toEqual(new Money(50, 'BRL')); // 500 - 450 = 50 (under budget)
    });

    it('should calculate variance when actual value is higher', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(550, 'BRL')
      });

      const variance = budgetItem.calculateVariance();

      expect(variance).toEqual(new Money(50, 'BRL')); // |500 - 550| = 50 (over budget)
    });

    it('should return zero variance when no actual value', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense'
      });

      const variance = budgetItem.calculateVariance();

      expect(variance).toEqual(new Money(0, 'BRL'));
    });

    it('should calculate percentage completion', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const percentage = budgetItem.calculatePercentageCompletion();

      expect(percentage).toBe(90); // (450 / 500) * 100 = 90%
    });

    it('should return zero percentage when no actual value', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense'
      });

      const percentage = budgetItem.calculatePercentageCompletion();

      expect(percentage).toBe(0);
    });

    it('should return 100% when actual equals planned', () => {
      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(500, 'BRL')
      });

      const percentage = budgetItem.calculatePercentageCompletion();

      expect(percentage).toBe(100);
    });

    it('should check if item is over budget', () => {
      const underBudgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const overBudgetItem = new BudgetItem({
        id: 'item-124',
        budgetId: 'budget-456',
        categoryName: 'Transporte',
        plannedValue: new Money(300, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(350, 'BRL')
      });

      expect(underBudgetItem.isOverBudget()).toBe(false);
      expect(overBudgetItem.isOverBudget()).toBe(true);
    });

    it('should check if item is under budget', () => {
      const underBudgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const overBudgetItem = new BudgetItem({
        id: 'item-124',
        budgetId: 'budget-456',
        categoryName: 'Transporte',
        plannedValue: new Money(300, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(350, 'BRL')
      });

      expect(underBudgetItem.isUnderBudget()).toBe(true);
      expect(overBudgetItem.isUnderBudget()).toBe(false);
    });

    it('should check if item is on budget', () => {
      const onBudgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(500, 'BRL')
      });

      const offBudgetItem = new BudgetItem({
        id: 'item-124',
        budgetId: 'budget-456',
        categoryName: 'Transporte',
        plannedValue: new Money(300, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(350, 'BRL')
      });

      expect(onBudgetItem.isOnBudget()).toBe(true);
      expect(offBudgetItem.isOnBudget()).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should return new instance when updating values', () => {
      const originalItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense'
      });

      const updatedItem = originalItem.updatePlannedValue(new Money(600, 'BRL'));

      expect(updatedItem).not.toBe(originalItem);
      expect(originalItem.plannedValue).toEqual(new Money(500, 'BRL'));
      expect(updatedItem.plannedValue).toEqual(new Money(600, 'BRL'));
    });
  });
});
