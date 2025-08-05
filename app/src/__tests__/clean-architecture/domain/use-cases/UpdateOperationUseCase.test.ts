// Tests for UpdateOperationUseCase
import { UpdateOperationUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateOperationUseCase';
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

describe('UpdateOperationUseCase', () => {
  let useCase: UpdateOperationUseCase;
  let mockRepository: MockOperationRepository;

  beforeEach(() => {
    mockRepository = new MockOperationRepository();
    useCase = new UpdateOperationUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update an existing operation successfully', async () => {
      // Create initial operation
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      // Update data
      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação',
        details: 'Compra no supermercado com desconto',
        project: 'Casa'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedOperation = result.getOrThrow().operation;
      
      expect(updatedOperation.id).toBe('op-1');
      expect(updatedOperation.state).toBe('pago');
      expect(updatedOperation.paymentMethod).toBe('Pix');
      expect(updatedOperation.date).toEqual(new Date('2024-01-16'));
      expect(updatedOperation.value).toEqual(new Money(450, 'BRL'));
      expect(updatedOperation.details).toBe('Compra no supermercado com desconto');
    });

    it('should fail when operation does not exist', async () => {
      const updateData = {
        id: 'non-existent',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Operation not found');
    });

    it('should update only provided fields', async () => {
      // Create initial operation
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      // Update only state
      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedOperation = result.getOrThrow().operation;
      
      expect(updatedOperation.state).toBe('pago');
      expect(updatedOperation.details).toBe('Compra no supermercado'); // Should remain unchanged
      expect(updatedOperation.project).toBe('Casa'); // Should remain unchanged
    });

    it('should preserve operation ID and creation date', async () => {
      const initialDate = new Date('2024-01-15');
      const initialOperation = new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: initialDate,
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedOperation = result.getOrThrow().operation;
      
      expect(updatedOperation.id).toBe('op-1');
      expect(updatedOperation.createdAt).toEqual(initialOperation.createdAt);
    });
  });

  describe('validation', () => {
    it('should fail when nature is invalid', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'invalid' as any,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid nature');
    });

    it('should fail when state is invalid', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'invalid' as any,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid state');
    });

    it('should fail when payment method is invalid', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Invalid Method' as any,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid payment method');
    });

    it('should fail when source account is empty', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: '',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Source account cannot be empty');
    });

    it('should fail when destination account is empty', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: '',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Destination account cannot be empty');
    });

    it('should fail when category is empty', async () => {
      const initialOperation = new Operation({
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

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: ''
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category cannot be empty');
    });

    it('should fail when state is incompatible with nature', async () => {
      const initialOperation = new Operation({
        id: 'op-1',
        nature: 'receita',
        state: 'receber',
        paymentMethod: 'Pix',
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      });

      await mockRepository.save(initialOperation);

      const updateData = {
        id: 'op-1',
        nature: 'receita' as const,
        state: 'pagar' as const, // Invalid state for receita
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-16'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('State "pagar" is not compatible with nature "receita"');
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

      const useCaseWithError = new UpdateOperationUseCase(errorRepository);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update operation');
    });

    it('should handle repository save errors', async () => {
      const initialOperation = new Operation({
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
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn().mockResolvedValue(initialOperation),
        findAll: jest.fn(),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      };

      const useCaseWithError = new UpdateOperationUseCase(errorRepository);

      const updateData = {
        id: 'op-1',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-16'),
        value: new Money(450, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update operation');
    });
  });
}); 