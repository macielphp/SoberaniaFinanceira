import { SQLiteCategoryRepository } from '../../../../clean-architecture/data/repositories/SQLiteCategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

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

describe('SQLiteCategoryRepository', () => {
  let repository: SQLiteCategoryRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteCategoryRepository();
  });

  describe('save', () => {
    it('should create a new category when id is not provided', async () => {
      const category = new Category({
        id: 'test-id',
        name: 'Alimentação',
        type: 'expense'
      });

      mockDatabase.getAllAsync.mockResolvedValueOnce([]); // findById returns empty
      mockDatabase.runAsync.mockResolvedValueOnce({
        lastInsertRowid: 1,
        changes: 1
      });

      const result = await repository.save(category);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO categories'),
        expect.arrayContaining([
          'test-id',
          'Alimentação',
          'expense'
        ])
      );

      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Alimentação');
    });

    it('should update an existing category when id is provided', async () => {
      const existingCategory = new Category({
        id: 'existing-id',
        name: 'Alimentação',
        type: 'expense'
      });

      const mockRows = [{
        id: 'existing-id',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const updatedCategory = new Category({
        id: 'existing-id',
        name: 'Alimentação Atualizada',
        type: 'expense'
      });

      const result = await repository.save(updatedCategory);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categories'),
        expect.arrayContaining([
          'Alimentação Atualizada',
          'expense',
          'existing-id'
        ])
      );

      expect(result.id).toBe('existing-id');
      expect(result.name).toBe('Alimentação Atualizada');
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      const mockRows = [{
        id: 'test-id',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findById('test-id');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe('test-id');
      expect(result!.name).toBe('Alimentação');
    });

    it('should return null when category not found', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockRows = [
        {
          id: 'category-1',
          name: 'Alimentação',
          type: 'expense',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'category-2',
          name: 'Salário',
          type: 'income',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories ORDER BY name')
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('category-1');
      expect(result[1].id).toBe('category-2');
    });
  });

  describe('delete', () => {
    it('should delete category and return true', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const result = await repository.delete('test-id');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM categories WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBe(true);
    });

    it('should return false when category not found', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 0
      });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findByType', () => {
    it('should return categories by type', async () => {
      const mockRows = [
        {
          id: 'category-1',
          name: 'Alimentação',
          type: 'expense',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findByType('expense');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories WHERE type = ? ORDER BY name'),
        ['expense']
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('expense');
    });
  });

  describe('findByName', () => {
    it('should return categories by name', async () => {
      const mockRows = [
        {
          id: 'category-1',
          name: 'Alimentação',
          type: 'expense',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findByName('Alimentação');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories WHERE name LIKE ? ORDER BY name'),
        ['%Alimentação%']
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alimentação');
    });
  });

  describe('count', () => {
    it('should return total number of categories', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([{ count: 10 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM categories')
      );

      expect(result).toBe(10);
    });
  });
}); 