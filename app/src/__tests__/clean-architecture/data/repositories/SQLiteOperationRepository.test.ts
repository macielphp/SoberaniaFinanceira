// Tests for SQLiteOperationRepository
import { SQLiteOperationRepository } from '../../../../clean-architecture/data/repositories/SQLiteOperationRepository';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
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

describe('SQLiteOperationRepository', () => {
  let repository: SQLiteOperationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteOperationRepository();
  });

  describe('save', () => {
    it('should save a new operation', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]); // findById returns empty (new operation)
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const operation = new Operation({
        id: 'op-123',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Supermercado',
        date: new Date('2024-01-15T10:30:00.000Z'),
        value: new Money(150.50, 'BRL'),
        category: 'Alimentação',
        details: 'Compra no supermercado'
      });

      const result = await repository.save(operation);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO operations'),
        [
          'op-123',
          'despesa',
          'pago',
          'Pix',
          'Conta Principal',
          'Supermercado',
          '2024-01-15T10:30:00.000Z',
          150.50,
          'Alimentação',
          'Compra no supermercado',
          null,
          null,
          expect.any(String)
        ]
      );
      expect(result).toEqual(operation);
    });

    it('should update an existing operation', async () => {
      mockDatabase.getAllAsync.mockResolvedValueOnce([{
        id: 'op-123',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Transferência bancária',
        sourceAccount: 'Empresa',
        destinationAccount: 'Conta Principal',
        date: '2024-01-01T08:00:00.000Z',
        value: 5000,
        category: 'Salário',
        details: 'Salário mensal',
        project: null,
        receipt: null,
        createdAt: '2024-01-01T08:00:00.000Z'
      }]); // findById returns existing
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const operation = new Operation({
        id: 'op-123',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Transferência bancária',
        sourceAccount: 'Empresa',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-01T08:00:00.000Z'),
        value: new Money(5000, 'BRL'),
        category: 'Salário',
        details: 'Salário mensal'
      });

      const result = await repository.save(operation);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE operations'),
        [
          'receita',
          'recebido',
          'Transferência bancária',
          'Empresa',
          'Conta Principal',
          '2024-01-01T08:00:00.000Z',
          5000,
          'Salário',
          'Salário mensal',
          null,
          null,
          'op-123'
        ]
      );
      expect(result).toEqual(operation);
    });
  });

  describe('findById', () => {
    it('should find operation by id', async () => {
      const mockRow = {
        id: 'op-123',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Supermercado',
        date: '2024-01-15T10:30:00.000Z',
        value: 150.50,
        category: 'Alimentação',
        details: 'Compra no supermercado',
        project: null,
        receipt: null,
        createdAt: '2024-01-15T10:30:00.000Z'
      };

      mockDatabase.getAllAsync.mockResolvedValue([mockRow]);

      const result = await repository.findById('op-123');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM operations WHERE id = ?'),
        ['op-123']
      );
      expect(result).toBeInstanceOf(Operation);
      expect(result?.id).toBe('op-123');
      expect(result?.nature).toBe('despesa');
      expect(result?.state).toBe('pago');
    });

    it('should return null when operation not found', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all operations', async () => {
      const mockRows = [
        {
          id: 'op-1',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'Conta 1',
          destinationAccount: 'Loja 1',
          date: '2024-01-01T10:00:00.000Z',
          value: 100,
          category: 'Categoria 1',
          details: 'Operação 1',
          project: null,
          receipt: null,
          createdAt: '2024-01-01T10:00:00.000Z'
        },
        {
          id: 'op-2',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Transferência bancária',
          sourceAccount: 'Empresa',
          destinationAccount: 'Conta 1',
          date: '2024-01-02T08:00:00.000Z',
          value: 2000,
          category: 'Salário',
          details: 'Operação 2',
          project: null,
          receipt: null,
          createdAt: '2024-01-02T08:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      const result = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM operations')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Operation);
      expect(result[1]).toBeInstanceOf(Operation);
      expect(result[0].id).toBe('op-1');
      expect(result[1].id).toBe('op-2');
    });

    it('should return empty array when no operations exist', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete operation by id', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('op-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM operations WHERE id = ?'),
        ['op-123']
      );
      expect(result).toBe(true);
    });

    it('should handle deletion of non-existent operation', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findByAccount', () => {
    it('should find operations by account', async () => {
      const mockRows = [
        {
          id: 'op-1',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Loja 1',
          date: '2024-01-01T10:00:00.000Z',
          value: 100,
          category: 'Categoria 1',
          details: 'Operação 1',
          project: null,
          receipt: null,
          createdAt: '2024-01-01T10:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      const result = await repository.findByAccount('Conta Principal');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('sourceAccount = ? OR destinationAccount = ?'),
        ['Conta Principal', 'Conta Principal']
      );
      expect(result).toHaveLength(1);
      expect(result[0].sourceAccount).toBe('Conta Principal');
    });
  });

  describe('findByPeriod', () => {
    it('should find operations by period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockRows = [
        {
          id: 'op-1',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Loja 1',
          date: '2024-01-15T10:00:00.000Z',
          value: 100,
          category: 'Categoria 1',
          details: 'Operação 1',
          project: null,
          receipt: null,
          createdAt: '2024-01-15T10:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      const result = await repository.findByPeriod(startDate, endDate);

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('date BETWEEN ? AND ?'),
        [startDate.toISOString(), endDate.toISOString()]
      );
      expect(result).toHaveLength(1);
    });
  });
}); 