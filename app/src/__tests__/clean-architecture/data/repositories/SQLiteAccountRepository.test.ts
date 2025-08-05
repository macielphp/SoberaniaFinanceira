import { SQLiteAccountRepository } from '../../../../clean-architecture/data/repositories/SQLiteAccountRepository';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
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

describe('SQLiteAccountRepository', () => {
  let repository: SQLiteAccountRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteAccountRepository();
  });

  describe('save', () => {
    it('should create a new account when id is not provided', async () => {
      const account = new Account({
        id: 'test-id',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        color: '#FF0000'
      });

      mockDatabase.getAllAsync.mockResolvedValueOnce([]); // findById returns empty
      mockDatabase.runAsync.mockResolvedValueOnce({
        lastInsertRowid: 1,
        changes: 1
      });

      const result = await repository.save(account);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO accounts'),
        expect.arrayContaining([
          expect.any(String), // id
          'Conta Corrente',
          'propria',
          1000
        ])
      );

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Conta Corrente');
    });

    it('should update an existing account when id is provided', async () => {
      const existingAccount = new Account({
        id: 'existing-id',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        color: '#FF0000'
      });

      const mockRows = [{
        id: 'existing-id',
        name: 'Conta Corrente',
        type: 'propria',
        saldo: 1000,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const updatedAccount = new Account({
        id: 'existing-id',
        name: 'Conta Corrente Atualizada',
        type: 'corrente',
        balance: new Money(2000),
        color: '#00FF00'
      });

      const result = await repository.save(updatedAccount);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE accounts'),
        expect.arrayContaining([
          'Conta Corrente Atualizada',
          'propria',
          2000,
          'existing-id'
        ])
      );

      expect(result.id).toBe('existing-id');
      expect(result.name).toBe('Conta Corrente Atualizada');
    });
  });

  describe('findById', () => {
    it('should return account when found', async () => {
      const mockRows = [{
        id: 'test-id',
        name: 'Conta Corrente',
        type: 'propria',
        saldo: 1000,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findById('test-id');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM accounts WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe('test-id');
      expect(result!.name).toBe('Conta Corrente');
    });

    it('should return null when account not found', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all accounts', async () => {
      const mockRows = [
        {
          id: 'account-1',
          name: 'Conta Corrente',
          type: 'propria',
          saldo: 1000,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'account-2',
          name: 'Conta Poupança',
          type: 'propria',
          saldo: 5000,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM accounts ORDER BY name')
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('account-1');
      expect(result[1].id).toBe('account-2');
    });
  });

  describe('delete', () => {
    it('should delete account and return true', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 1
      });

      const result = await repository.delete('test-id');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM accounts WHERE id = ?'),
        ['test-id']
      );

      expect(result).toBe(true);
    });

    it('should return false when account not found', async () => {
      mockDatabase.runAsync.mockResolvedValueOnce({
        changes: 0
      });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findByType', () => {
    it('should return accounts by type', async () => {
      const mockRows = [
        {
          id: 'account-1',
          name: 'Conta Corrente 1',
          type: 'propria',
          saldo: 1000,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValueOnce(mockRows);

      const result = await repository.findByType('corrente');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM accounts WHERE type = ? ORDER BY name'),
        ['propria']
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('corrente');
    });
  });

  describe('count', () => {
    it('should return total number of accounts', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([{ count: 5 }]);

      const result = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM accounts')
      );

      expect(result).toBe(5);
    });
  });
}); 