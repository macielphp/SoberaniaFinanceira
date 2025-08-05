// Tests for GetOperationByIdUseCase
import { GetOperationByIdUseCase } from '../../../../clean-architecture/domain/use-cases/GetOperationByIdUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockOperationRepository implements IOperationRepository {
  private operations: Operation[] = [];

  async save(operation: Operation): Promise<Operation> {
    const existingIndex = this.operations.findIndex(op => op.id === operation.id);
    if (existingIndex >= 0) {
      this.operations[existingIndex] = operation;
    } else {
      this.operations.push(operation);
    }
    return operation;
  }

  async findById(id: string): Promise<Operation | null> {
    return this.operations.find(op => op.id === id) || null;
  }

  async findAll(): Promise<Operation[]> {
    return [...this.operations];
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Operation[]> {
    return this.operations.filter(op => 
      op.date >= startDate && op.date <= endDate
    );
  }

  async findByAccount(accountId: string): Promise<Operation[]> {
    return this.operations.filter(op => 
      op.sourceAccount === accountId || op.destinationAccount === accountId
    );
  }

  async findByCategory(category: string): Promise<Operation[]> {
    return this.operations.filter(op => op.category === category);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.operations.findIndex(op => op.id === id);
    if (index >= 0) {
      this.operations.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.operations.length;
  }
}

describe('GetOperationByIdUseCase', () => {
  let useCase: GetOperationByIdUseCase;
  let mockRepository: MockOperationRepository;

  beforeEach(() => {
    mockRepository = new MockOperationRepository();
    useCase = new GetOperationByIdUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return an existing operation by ID', async () => {
      // Create test operation
      const operation = new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação',
        details: 'Compra no supermercado',
        project: 'Casa'
      });

      await mockRepository.save(operation);

      const result = await useCase.execute({ id: 'op-1' });

      expect(result.isSuccess()).toBe(true);
      const foundOperation = result.getOrThrow().operation;
      expect(foundOperation).toEqual(operation);
      expect(foundOperation).not.toBeNull();
      if (foundOperation) {
        expect(foundOperation.id).toBe('op-1');
        expect(foundOperation.nature).toBe('despesa');
        expect(foundOperation.state).toBe('pagar');
        expect(foundOperation.paymentMethod).toBe('Cartão de crédito');
        expect(foundOperation.sourceAccount).toBe('Conta Principal');
        expect(foundOperation.destinationAccount).toBe('Fornecedor');
        expect(foundOperation.date).toEqual(new Date('2024-01-15'));
        expect(foundOperation.value).toEqual(new Money(500, 'BRL'));
        expect(foundOperation.category).toBe('Alimentação');
        expect(foundOperation.details).toBe('Compra no supermercado');
        expect(foundOperation.project).toBe('Casa');
      }
    });

    it('should return null when operation does not exist', async () => {
      const result = await useCase.execute({ id: 'non-existent' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().operation).toBeNull();
    });

    it('should handle multiple operations correctly', async () => {
      // Create multiple operations
      const operation1 = new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      const operation2 = new Operation({
        id: 'op-2',
        nature: 'receita',
        state: 'receber',
        paymentMethod: 'Pix',
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-16'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      });

      await mockRepository.save(operation1);
      await mockRepository.save(operation2);

      // Get first operation
      const result1 = await useCase.execute({ id: 'op-1' });
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().operation).toEqual(operation1);

      // Get second operation
      const result2 = await useCase.execute({ id: 'op-2' });
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().operation).toEqual(operation2);

      // Get non-existent operation
      const result3 = await useCase.execute({ id: 'op-3' });
      expect(result3.isSuccess()).toBe(true);
      expect(result3.getOrThrow().operation).toBeNull();
    });

    it('should return operation with minimal data', async () => {
      const operation = new Operation({
        id: 'op-1',
        nature: 'receita',
        state: 'receber',
        paymentMethod: 'Pix',
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
        // No details or project
      });

      await mockRepository.save(operation);

      const result = await useCase.execute({ id: 'op-1' });

      expect(result.isSuccess()).toBe(true);
      const foundOperation = result.getOrThrow().operation;
      expect(foundOperation).toEqual(operation);
      expect(foundOperation).not.toBeNull();
      if (foundOperation) {
        expect(foundOperation.details).toBeUndefined();
        expect(foundOperation.project).toBeUndefined();
      }
    });
  });

  describe('validation', () => {
    it('should fail when id is empty', async () => {
      const result = await useCase.execute({ id: '' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation ID cannot be empty');
    });

    it('should fail when id is null', async () => {
      const result = await useCase.execute({ id: null as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation ID cannot be empty');
    });

    it('should fail when id is undefined', async () => {
      const result = await useCase.execute({ id: undefined as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation ID cannot be empty');
    });
  });

  describe('repository errors', () => {
    it('should handle repository findById errors', async () => {
      const errorRepository: IOperationRepository = {
        save: jest.fn(),
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
        findAll: jest.fn(),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      };

      const useCaseWithError = new GetOperationByIdUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'op-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get operation');
    });
  });
}); 