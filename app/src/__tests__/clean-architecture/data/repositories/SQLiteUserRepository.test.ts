import { SQLiteUserRepository } from '../../../../clean-architecture/data/repositories/SQLiteUserRepository';
import { User } from '../../../../clean-architecture/domain/entities/User';

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

describe('SQLiteUserRepository', () => {
  let repository: SQLiteUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteUserRepository();
  });

  describe('save', () => {
    it('should create a new user when id is not provided', async () => {
      const user = new User({
        id: 'test-id',
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123'
      });

      mockDatabase.getAllAsync.mockResolvedValueOnce([]); // findById returns empty
      mockDatabase.runAsync.mockResolvedValueOnce({
        lastInsertRowid: 1,
        changes: 1
      });

      const result = await repository.save(user);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          'test-id',
          'João Silva',
          'joao@example.com',
          'password123'
        ])
      );

      expect(result.id).toBe('test-id');
      expect(result.name).toBe('João Silva');
      expect(result.email).toBe('joao@example.com');
    });

    it('should update an existing user when id is provided', async () => {
      const existingUser = new User({
        id: 'existing-id',
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123'
      });

      const mockRows = [{
        id: 'existing-id',
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const updatedUser = new User({
        id: 'existing-id',
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com',
        password: 'newpassword123'
      });

      const result = await repository.save(updatedUser);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining([
          'João Silva Atualizado',
          'joao.novo@example.com',
          'newpassword123',
          'existing-id'
        ])
      );

      expect(result.id).toBe('existing-id');
      expect(result.name).toBe('João Silva Atualizado');
      expect(result.email).toBe('joao.novo@example.com');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockRows = [{
        id: 'test-id',
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findById('test-id');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['test-id']
      );

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('João Silva');
      expect(result?.email).toBe('joao@example.com');
    });

    it('should return null when user not found', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([]);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockRows = [
        {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'password123',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'user-2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          password: 'password456',
          isActive: true,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM users ORDER BY name'
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].id).toBe('user-1');
      expect(result[0].name).toBe('João Silva');
      expect(result[1].id).toBe('user-2');
      expect(result[1].name).toBe('Maria Santos');
    });

    it('should return empty array when no users exist', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const result = await repository.delete('test-id');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        ['test-id']
      );

      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 0
      });

      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total number of users', async () => {
      mockDatabase.getFirstAsync.mockResolvedValueOnce({
        count: 5
      });

      const result = await repository.count();

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM users'
      );

      expect(result).toBe(5);
    });

    it('should return 0 when no users exist', async () => {
      mockDatabase.getFirstAsync.mockResolvedValueOnce({
        count: 0
      });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });
});
