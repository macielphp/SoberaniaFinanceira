import { SQLiteGoalRepository } from '../../../../clean-architecture/data/repositories/SQLiteGoalRepository';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock expo-sqlite
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDatabase),
}));

describe('SQLiteGoalRepository', () => {
  let repository: SQLiteGoalRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteGoalRepository();
  });

  describe('save', () => {
    it('should create a new goal when id is not provided', async () => {
      const goal = new Goal({
        id: 'test-id',
        userId: 'user-1',
        description: 'Viagem para Europa',
        type: 'economia',
        targetValue: new Money(10000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1000),
        numParcela: 12
      });

      mockDatabase.getAllAsync.mockResolvedValueOnce([]); // findById returns empty
      mockDatabase.runAsync.mockResolvedValueOnce({
        lastInsertRowid: 1,
        changes: 1
      });

      const result = await repository.save(goal);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO goals'),
        expect.arrayContaining([
          'test-id',
          'user-1',
          'Viagem para Europa',
          'economia',
          10000
        ])
      );

      expect(result.id).toBe('test-id');
      expect(result.description).toBe('Viagem para Europa');
    });

    it('should update an existing goal when id is provided', async () => {
      const existingGoal = new Goal({
        id: 'existing-id',
        userId: 'user-1',
        description: 'Viagem para Europa',
        type: 'economia',
        targetValue: new Money(10000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1000),
        numParcela: 12
      });

      const mockRows = [{
        id: 'existing-id',
        user_id: 'user-1',
        description: 'Viagem para Europa',
        type: 'economia',
        target_value: 10000,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T00:00:00.000Z',
        monthly_income: 5000,
        fixed_expenses: 2000,
        available_per_month: 3000,
        importance: 'alta',
        priority: 1,
        monthly_contribution: 1000,
        num_parcela: 12,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const updatedGoal = new Goal({
        id: 'existing-id',
        userId: 'user-1',
        description: 'Viagem para Europa Atualizada',
        type: 'economia',
        targetValue: new Money(15000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(2000),
        availablePerMonth: new Money(3000),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500),
        numParcela: 12
      });

      const result = await repository.save(updatedGoal);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE goals'),
        expect.arrayContaining([
          'user-1',
          'Viagem para Europa Atualizada',
          'economia',
          15000
        ])
      );

      expect(result.id).toBe('existing-id');
      expect(result.description).toBe('Viagem para Europa Atualizada');
    });
  });

  describe('findById', () => {
    it('should return goal when found', async () => {
      const mockRows = [{
        id: 'test-id',
        user_id: 'user-1',
        description: 'Viagem para Europa',
        type: 'economia',
        target_value: 10000,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T00:00:00.000Z',
        monthly_income: 5000,
        fixed_expenses: 2000,
        available_per_month: 3000,
        importance: 'alta',
        priority: 1,
        monthly_contribution: 1000,
        num_parcela: 12,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findById('test-id');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe('test-id');
      expect(result!.description).toBe('Viagem para Europa');
    });

    it('should return null when goal not found', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all goals', async () => {
      const mockRows = [
        {
          id: 'goal-1',
          user_id: 'user-1',
          description: 'Viagem para Europa',
          type: 'economia',
          target_value: 10000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T00:00:00.000Z',
          monthly_income: 5000,
          fixed_expenses: 2000,
          available_per_month: 3000,
          importance: 'alta',
          priority: 1,
          monthly_contribution: 1000,
          num_parcela: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'goal-2',
          user_id: 'user-1',
          description: 'Comprar Carro',
          type: 'compra',
          target_value: 50000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2025-06-30T00:00:00.000Z',
          monthly_income: 5000,
          fixed_expenses: 2000,
          available_per_month: 3000,
          importance: 'alta',
          priority: 2,
          monthly_contribution: 2000,
          num_parcela: 24,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals ORDER BY end_date')
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('goal-1');
      expect(result[1].id).toBe('goal-2');
    });
  });

  describe('delete', () => {
    it('should delete goal and return true', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const result = await repository.delete('test-id');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM goals WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBe(true);
    });

    it('should return false when goal not found', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 0
      });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findByDateRange', () => {
    it('should return goals by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const mockRows = [
        {
          id: 'goal-1',
          user_id: 'user-1',
          description: 'Viagem para Europa',
          type: 'economia',
          target_value: 10000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T00:00:00.000Z',
          monthly_income: 5000,
          fixed_expenses: 2000,
          available_per_month: 3000,
          importance: 'alta',
          priority: 1,
          monthly_contribution: 1000,
          num_parcela: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findByDateRange(startDate, endDate);

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals WHERE end_date BETWEEN ? AND ? ORDER BY end_date'),
        ['2024-01-01T00:00:00.000Z', '2024-12-31T00:00:00.000Z']
      );

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Viagem para Europa');
    });
  });

  describe('findActive', () => {
    it('should return active goals', async () => {
      const mockRows = [
        {
          id: 'goal-1',
          user_id: 'user-1',
          description: 'Viagem para Europa',
          type: 'economia',
          target_value: 10000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T00:00:00.000Z',
          monthly_income: 5000,
          fixed_expenses: 2000,
          available_per_month: 3000,
          importance: 'alta',
          priority: 1,
          monthly_contribution: 1000,
          num_parcela: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findActive();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals WHERE end_date >= ? ORDER BY end_date'),
        expect.any(Array)
      );

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Viagem para Europa');
    });
  });

  describe('count', () => {
    it('should return total number of goals', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([{ count: 5 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM goals')
      );

      expect(result).toBe(5);
    });
  });

  describe('countActive', () => {
    it('should return total number of active goals', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([{ count: 3 }]);

      const result = await repository.countActive();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM goals WHERE end_date >= ?'),
        expect.any(Array)
      );

      expect(result).toBe(3);
    });
  });
}); 