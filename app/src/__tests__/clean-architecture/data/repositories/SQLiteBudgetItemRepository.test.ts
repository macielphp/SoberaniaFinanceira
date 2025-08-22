// Tests for SQLiteBudgetItemRepository
// Following TDD and Clean Architecture patterns

import { SQLiteBudgetItemRepository } from '../../../../clean-architecture/data/repositories/SQLiteBudgetItemRepository';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock SQLite database
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  close: jest.fn()
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDatabase)
}));

describe('SQLiteBudgetItemRepository', () => {
  let repository: SQLiteBudgetItemRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteBudgetItemRepository();
  });

  describe('save', () => {
    it('should save a new budget item', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]); // findById returns empty (new item)
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const budgetItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação',
        plannedValue: new Money(500, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(450, 'BRL')
      });

      const result = await repository.save(budgetItem);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budget_items'),
        [
          'item-123',
          'budget-456',
          'Alimentação',
          500,
          'expense',
          450,
          expect.any(String)
        ]
      );
      expect(result).toEqual(budgetItem);
    });

    it('should update an existing budget item', async () => {
      const mockItemData = {
        id: 'item-123',
        budget_id: 'budget-456',
        category_name: 'Alimentação',
        planned_value: 500,
        category_type: 'expense',
        actual_value: 450,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValueOnce([mockItemData]); // findById returns existing
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const updatedItem = new BudgetItem({
        id: 'item-123',
        budgetId: 'budget-456',
        categoryName: 'Alimentação Atualizada',
        plannedValue: new Money(600, 'BRL'),
        categoryType: 'expense',
        actualValue: new Money(550, 'BRL')
      });

      const result = await repository.save(updatedItem);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE budget_items'),
        [
          'budget-456',
          'Alimentação Atualizada',
          600,
          'expense',
          550,
          'item-123'
        ]
      );
      expect(result).toEqual(updatedItem);
    });
  });

  describe('findById', () => {
    it('should find budget item by id', async () => {
      const mockItemData = {
        id: 'item-123',
        budget_id: 'budget-456',
        category_name: 'Alimentação',
        planned_value: 500,
        category_type: 'expense',
        actual_value: 450,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValue([mockItemData]);

      const result = await repository.findById('item-123');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budget_items WHERE id = ?'),
        ['item-123']
      );
      expect(result).toBeInstanceOf(BudgetItem);
      expect(result?.id).toBe('item-123');
      expect(result?.categoryName).toBe('Alimentação');
    });

    it('should return null for non-existent budget item', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all budget items', async () => {
      const mockItemsData = [
        {
          id: 'item-1',
          budget_id: 'budget-456',
          category_name: 'Alimentação',
          planned_value: 500,
          category_type: 'expense',
          actual_value: 450,
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'item-2',
          budget_id: 'budget-456',
          category_name: 'Transporte',
          planned_value: 300,
          category_type: 'expense',
          actual_value: 280,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockItemsData);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budget_items ORDER BY created_at DESC')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BudgetItem);
      expect(result[1]).toBeInstanceOf(BudgetItem);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-2');
    });

    it('should return empty array when no budget items exist', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByBudget', () => {
    it('should find budget items by budget id', async () => {
      const mockItemsData = [
        {
          id: 'item-1',
          budget_id: 'budget-456',
          category_name: 'Alimentação',
          planned_value: 500,
          category_type: 'expense',
          actual_value: 450,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockItemsData);

      const result = await repository.findByBudget('budget-456');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budget_items WHERE budget_id = ?'),
        ['budget-456']
      );
      expect(result).toHaveLength(1);
      expect(result[0].budgetId).toBe('budget-456');
    });
  });

  describe('findByCategory', () => {
    it('should find budget items by category name', async () => {
      const mockItemsData = [
        {
          id: 'item-1',
          budget_id: 'budget-456',
          category_name: 'Alimentação',
          planned_value: 500,
          category_type: 'expense',
          actual_value: 450,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockItemsData);

      const result = await repository.findByCategory('Alimentação');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budget_items WHERE category_name = ?'),
        ['Alimentação']
      );
      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe('Alimentação');
    });
  });

  describe('delete', () => {
    it('should delete budget item by id', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('item-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM budget_items WHERE id = ?'),
        ['item-123']
      );
      expect(result).toBe(true);
    });

    it('should return false when budget item does not exist', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count total budget items', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([{ count: 5 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM budget_items')
      );
      expect(result).toBe(5);
    });
  });
});
