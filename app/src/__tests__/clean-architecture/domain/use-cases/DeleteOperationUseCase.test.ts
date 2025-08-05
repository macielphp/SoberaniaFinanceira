// Tests for DeleteOperationUseCase
import { DeleteOperationUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteOperationUseCase';
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

describe('DeleteOperationUseCase', () => {
  let useCase: DeleteOperationUseCase;
  let mockRepository: MockOperationRepository;

  beforeEach(() => {
    mockRepository = new MockOperationRepository();
    useCase = new DeleteOperationUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete an existing operation successfully', async () => {
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

      // Verify operation exists
      const existingOperation = await mockRepository.findById('op-1');
      expect(existingOperation).toBeDefined();

      // Delete operation
      const result = await useCase.execute({ id: 'op-1' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);

      // Verify operation was deleted
      const deletedOperation = await mockRepository.findById('op-1');
      expect(deletedOperation).toBeNull();
    });

    it('should fail when operation does not exist', async () => {
      const result = await useCase.execute({ id: 'non-existent' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation not found');
    });

    it('should return false when repository delete returns false', async () => {
      // Create a mock repository that returns false for delete
      const falseDeleteRepository: IOperationRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(null),
        findAll: jest.fn(),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn().mockResolvedValue(false),
        count: jest.fn()
      };

      const useCaseWithFalseDelete = new DeleteOperationUseCase(falseDeleteRepository);

      const result = await useCaseWithFalseDelete.execute({ id: 'op-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation not found');
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

      // Verify both operations exist
      expect(await mockRepository.count()).toBe(2);

      // Delete first operation
      const result1 = await useCase.execute({ id: 'op-1' });
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().deleted).toBe(true);

      // Verify only first operation was deleted
      expect(await mockRepository.findById('op-1')).toBeNull();
      expect(await mockRepository.findById('op-2')).toBeDefined();
      expect(await mockRepository.count()).toBe(1);

      // Delete second operation
      const result2 = await useCase.execute({ id: 'op-2' });
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().deleted).toBe(true);

      // Verify both operations were deleted
      expect(await mockRepository.findById('op-2')).toBeNull();
      expect(await mockRepository.count()).toBe(0);
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

      const useCaseWithError = new DeleteOperationUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'op-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete operation');
    });

    it('should handle repository delete errors', async () => {
      const operation = new Operation({
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

      const errorRepository: IOperationRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(operation),
        findAll: jest.fn(),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn().mockRejectedValue(new Error('Database error')),
        count: jest.fn()
      };

      const useCaseWithError = new DeleteOperationUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'op-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete operation');
    });
  });
}); 