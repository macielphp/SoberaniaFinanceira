// Tests for CreateOperationUseCase
import { CreateOperationUseCase } from '../../../../clean-architecture/domain/use-cases/CreateOperationUseCase';
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

describe('CreateOperationUseCase', () => {
  let useCase: CreateOperationUseCase;
  let mockRepository: MockOperationRepository;

  beforeEach(() => {
    mockRepository = new MockOperationRepository();
    useCase = new CreateOperationUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a new operation successfully', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação',
        details: 'Compra no supermercado',
        project: 'Casa'
      };

      const result = await useCase.execute(operationData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().operation).toBeInstanceOf(Operation);
      
      const operation = result.getOrThrow().operation;
      expect(operation.nature).toBe('despesa');
      expect(operation.state).toBe('pagar');
      expect(operation.paymentMethod).toBe('Cartão de crédito');
      expect(operation.sourceAccount).toBe('Conta Principal');
      expect(operation.destinationAccount).toBe('Fornecedor');
      expect(operation.date).toEqual(new Date('2024-01-15'));
      expect(operation.value).toEqual(new Money(500, 'BRL'));
      expect(operation.category).toBe('Alimentação');
      expect(operation.details).toBe('Compra no supermercado');
      expect(operation.project).toBe('Casa');
      expect(operation.id).toBeDefined();
      expect(operation.createdAt).toBeInstanceOf(Date);
    });

    it('should create operation with minimal required data', async () => {
      const operationData = {
        nature: 'receita' as const,
        state: 'receber' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      };

      const result = await useCase.execute(operationData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().operation).toBeInstanceOf(Operation);
      
      const operation = result.getOrThrow().operation;
      expect(operation.nature).toBe('receita');
      expect(operation.state).toBe('receber');
      expect(operation.details).toBeUndefined();
      expect(operation.project).toBeUndefined();
    });

    it('should save operation to repository', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);
      const operation = result.getOrThrow().operation;

      // Verify operation was saved to repository
      const savedOperation = await mockRepository.findById(operation.id);
      expect(savedOperation).toEqual(operation);
    });

    it('should generate unique ID for each operation', async () => {
      const operationData1 = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const operationData2 = {
        nature: 'receita' as const,
        state: 'receber' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-16'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      };

      const result1 = await useCase.execute(operationData1);
      const result2 = await useCase.execute(operationData2);

      const operation1 = result1.getOrThrow().operation;
      const operation2 = result2.getOrThrow().operation;

      expect(operation1.id).not.toBe(operation2.id);
    });
  });

  describe('validation', () => {
    it('should fail when nature is invalid', async () => {
      const operationData = {
        nature: 'invalid' as any,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid nature');
    });

    it('should fail when state is invalid', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'invalid' as any,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid state');
    });

    it('should fail when payment method is invalid', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Invalid Method' as any,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid payment method');
    });

    it('should fail when source account is empty', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: '',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Source account cannot be empty');
    });

    it('should fail when destination account is empty', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: '',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Destination account cannot be empty');
    });

    it('should fail when category is empty', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: ''
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category cannot be empty');
    });

    it('should fail when state is incompatible with nature', async () => {
      const operationData = {
        nature: 'receita' as const,
        state: 'pagar' as const, // Invalid state for receita
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      };

      const result = await useCase.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('State "pagar" is not compatible with nature "receita"');
    });
  });

  describe('repository errors', () => {
    it('should handle repository save errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IOperationRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByDateRange: jest.fn(),
        findByAccount: jest.fn(),
        findByCategory: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      };

      const useCaseWithError = new CreateOperationUseCase(errorRepository);

      const operationData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      };

      const result = await useCaseWithError.execute(operationData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create operation');
    });
  });
}); 