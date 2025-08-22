// Tests for SQLiteBudgetRepository
// Following TDD and Clean Architecture patterns

import { SQLiteBudgetRepository } from '../../../../clean-architecture/data/repositories/SQLiteBudgetRepository';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
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

describe('SQLiteBudgetRepository', () => {
  let repository: SQLiteBudgetRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteBudgetRepository();
  });

  describe('save', () => {
    it('should save a new budget', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]); // findById returns empty (new budget)
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Janeiro 2024',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(5000, 'BRL'),
        isActive: true,
        status: 'active'
      });

      const result = await repository.save(budget);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budgets'),
        [
          'budget-123',
          'user-456',
          'Orçamento Janeiro 2024',
          '2024-01-01T00:00:00.000Z',
          '2024-01-31T00:00:00.000Z',
          'manual',
          5000,
          1,
          'active',
          expect.any(String)
        ]
      );
      expect(result).toEqual(budget);
    });

    it('should update an existing budget', async () => {
      const mockBudgetData = {
        id: 'budget-123',
        user_id: 'user-456',
        name: 'Orçamento Janeiro 2024',
        start_period: '2024-01-01T00:00:00.000Z',
        end_period: '2024-01-31T00:00:00.000Z',
        type: 'manual',
        total_planned_value: 5000,
        is_active: 1,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValueOnce([mockBudgetData]); // findById returns existing
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const updatedBudget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Janeiro 2024 - Atualizado',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(5000, 'BRL'),
        isActive: true,
        status: 'active'
      });

      const result = await repository.save(updatedBudget);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE budgets'),
        [
          'user-456',
          'Orçamento Janeiro 2024 - Atualizado',
          '2024-01-01T00:00:00.000Z',
          '2024-01-31T00:00:00.000Z',
          'manual',
          5000,
          1,
          'active',
          'budget-123'
        ]
      );
      expect(result).toEqual(updatedBudget);
    });
  });

  describe('findById', () => {
    it('should find budget by id', async () => {
      const mockBudgetData = {
        id: 'budget-123',
        user_id: 'user-456',
        name: 'Orçamento Janeiro 2024',
        start_period: '2024-01-01T00:00:00.000Z',
        end_period: '2024-01-31T00:00:00.000Z',
        type: 'manual',
        total_planned_value: 5000,
        is_active: 1,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValue([mockBudgetData]);

      const result = await repository.findById('budget-123');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets WHERE id = ?'),
        ['budget-123']
      );
      expect(result).toBeInstanceOf(Budget);
      expect(result?.id).toBe('budget-123');
      expect(result?.name).toBe('Orçamento Janeiro 2024');
    });

    it('should return null for non-existent budget', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all budgets', async () => {
      const mockBudgetsData = [
        {
          id: 'budget-1',
          user_id: 'user-456',
          name: 'Orçamento Janeiro 2024',
          start_period: '2024-01-01T00:00:00.000Z',
          end_period: '2024-01-31T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 5000,
          is_active: 1,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'budget-2',
          user_id: 'user-456',
          name: 'Orçamento Fevereiro 2024',
          start_period: '2024-02-01T00:00:00.000Z',
          end_period: '2024-02-29T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 6000,
          is_active: 1,
          status: 'active',
          created_at: '2024-02-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockBudgetsData);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets ORDER BY created_at DESC')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Budget);
      expect(result[1]).toBeInstanceOf(Budget);
      expect(result[0].id).toBe('budget-1');
      expect(result[1].id).toBe('budget-2');
    });

    it('should return empty array when no budgets exist', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByUser', () => {
    it('should find budgets by user id', async () => {
      const mockBudgetData = [
        {
          id: 'budget-1',
          user_id: 'user-456',
          name: 'Orçamento Janeiro 2024',
          start_period: '2024-01-01T00:00:00.000Z',
          end_period: '2024-01-31T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 5000,
          is_active: 1,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockBudgetData);

      const result = await repository.findByUser('user-456');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets WHERE user_id = ?'),
        ['user-456']
      );
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
    });
  });

  describe('findActiveByUser', () => {
    it('should find active budgets by user id', async () => {
      const mockBudgetData = [
        {
          id: 'budget-1',
          user_id: 'user-456',
          name: 'Orçamento Ativo',
          start_period: '2024-01-01T00:00:00.000Z',
          end_period: '2024-12-31T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 5000,
          is_active: 1,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockBudgetData);

      const result = await repository.findActiveByUser('user-456');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets'),
        ['user-456']
      );
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
      expect(result[0].status).toBe('active');
    });
  });

  describe('findByDateRange', () => {
    it('should find budgets within date range', async () => {
      const mockBudgetsData = [
        {
          id: 'budget-1',
          user_id: 'user-456',
          name: 'Orçamento Janeiro 2024',
          start_period: '2024-01-01T00:00:00.000Z',
          end_period: '2024-01-31T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 5000,
          is_active: 1,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'budget-2',
          user_id: 'user-456',
          name: 'Orçamento Fevereiro 2024',
          start_period: '2024-02-01T00:00:00.000Z',
          end_period: '2024-02-29T00:00:00.000Z',
          type: 'manual',
          total_planned_value: 6000,
          is_active: 1,
          status: 'active',
          created_at: '2024-02-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockBudgetsData);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-02-29');
      const result = await repository.findByDateRange(startDate, endDate);

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets'),
        ['2024-01-01T00:00:00.000Z', '2024-02-29T00:00:00.000Z']
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete budget by id', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('budget-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM budgets WHERE id = ?'),
        ['budget-123']
      );
      expect(result).toBe(true);
    });

    it('should return false when budget does not exist', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count total budgets', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([{ count: 2 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM budgets')
      );
      expect(result).toBe(2);
    });
  });
});