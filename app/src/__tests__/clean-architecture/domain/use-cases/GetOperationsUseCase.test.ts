// Tests for GetOperationsUseCase
import { GetOperationsUseCase } from '../../../../clean-architecture/domain/use-cases/GetOperationsUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockOperationRepository implements IOperationRepository {
  private operations: Operation[] = [];

  async save(operation: Operation): Promise<Operation> {
    this.operations.push(operation);
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

describe('GetOperationsUseCase', () => {
  let useCase: GetOperationsUseCase;
  let mockRepository: MockOperationRepository;

  beforeEach(() => {
    mockRepository = new MockOperationRepository();
    useCase = new GetOperationsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return all operations when no filters are provided', async () => {
      // Create test operations
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

      const result = await useCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toHaveLength(2);
      expect(operations).toContainEqual(operation1);
      expect(operations).toContainEqual(operation2);
    });

    it('should return empty array when no operations exist', async () => {
      const result = await useCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toEqual([]);
    });

    it('should filter operations by date range', async () => {
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
        date: new Date('2024-01-20'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      });

      const operation3 = new Operation({
        id: 'op-3',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-02-01'),
        value: new Money(300, 'BRL'),
        category: 'Transporte'
      });

      await mockRepository.save(operation1);
      await mockRepository.save(operation2);
      await mockRepository.save(operation3);

      const result = await useCase.execute({
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-25')
      });

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toHaveLength(2);
      expect(operations).toContainEqual(operation1);
      expect(operations).toContainEqual(operation2);
      expect(operations).not.toContainEqual(operation3);
    });

    it('should filter operations by account', async () => {
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

      const operation3 = new Operation({
        id: 'op-3',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Poupança',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-17'),
        value: new Money(300, 'BRL'),
        category: 'Transporte'
      });

      await mockRepository.save(operation1);
      await mockRepository.save(operation2);
      await mockRepository.save(operation3);

      const result = await useCase.execute({
        accountId: 'Conta Principal'
      });

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toHaveLength(2);
      expect(operations).toContainEqual(operation1);
      expect(operations).toContainEqual(operation2);
      expect(operations).not.toContainEqual(operation3);
    });

    it('should filter operations by category', async () => {
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
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(300, 'BRL'),
        category: 'Alimentação'
      });

      const operation3 = new Operation({
        id: 'op-3',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-17'),
        value: new Money(200, 'BRL'),
        category: 'Transporte'
      });

      await mockRepository.save(operation1);
      await mockRepository.save(operation2);
      await mockRepository.save(operation3);

      const result = await useCase.execute({
        category: 'Alimentação'
      });

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toHaveLength(2);
      expect(operations).toContainEqual(operation1);
      expect(operations).toContainEqual(operation2);
      expect(operations).not.toContainEqual(operation3);
    });

    it('should combine multiple filters', async () => {
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
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-20'),
        value: new Money(300, 'BRL'),
        category: 'Alimentação'
      });

      const operation3 = new Operation({
        id: 'op-3',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-02-01'),
        value: new Money(200, 'BRL'),
        category: 'Alimentação'
      });

      await mockRepository.save(operation1);
      await mockRepository.save(operation2);
      await mockRepository.save(operation3);

      const result = await useCase.execute({
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-25'),
        accountId: 'Conta Principal',
        category: 'Alimentação'
      });

      expect(result.isSuccess()).toBe(true);
      const operations = result.getOrThrow().operations;
      expect(operations).toHaveLength(2);
      expect(operations).toContainEqual(operation1);
      expect(operations).toContainEqual(operation2);
      expect(operations).not.toContainEqual(operation3);
    });
  });

  describe('repository errors', () => {
    it('should handle repository errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IOperationRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      };

      const useCaseWithError = new GetOperationsUseCase(errorRepository);

      const result = await useCaseWithError.execute({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get operations');
    });
  });
}); 