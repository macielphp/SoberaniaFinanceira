// Tests for IOperationRepository Interface
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock implementation for testing
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

describe('IOperationRepository', () => {
  let repository: IOperationRepository;

  beforeEach(() => {
    repository = new MockOperationRepository();
  });

  describe('save', () => {
    it('should save a new operation', async () => {
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

      const savedOperation = await repository.save(operation);
      expect(savedOperation).toEqual(operation);
      
      const found = await repository.findById('op-1');
      expect(found).toEqual(operation);
    });

    it('should update an existing operation', async () => {
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

      await repository.save(operation);

      const updatedOperation = new Operation({
        id: 'op-1',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      const saved = await repository.save(updatedOperation);
      expect(saved.state).toBe('pago');
      
      const found = await repository.findById('op-1');
      expect(found?.state).toBe('pago');
    });
  });

  describe('findById', () => {
    it('should return operation when found', async () => {
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

      await repository.save(operation);
      const found = await repository.findById('op-1');
      expect(found).toEqual(operation);
    });

    it('should return null when operation not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all operations', async () => {
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

      await repository.save(operation1);
      await repository.save(operation2);

      const allOperations = await repository.findAll();
      expect(allOperations).toHaveLength(2);
      expect(allOperations).toContainEqual(operation1);
      expect(allOperations).toContainEqual(operation2);
    });

    it('should return empty array when no operations exist', async () => {
      const allOperations = await repository.findAll();
      expect(allOperations).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    it('should return operations within date range', async () => {
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

      await repository.save(operation1);
      await repository.save(operation2);
      await repository.save(operation3);

      const startDate = new Date('2024-01-10');
      const endDate = new Date('2024-01-25');
      const operationsInRange = await repository.findByDateRange(startDate, endDate);

      expect(operationsInRange).toHaveLength(2);
      expect(operationsInRange).toContainEqual(operation1);
      expect(operationsInRange).toContainEqual(operation2);
      expect(operationsInRange).not.toContainEqual(operation3);
    });
  });

  describe('findByAccount', () => {
    it('should return operations for specific account', async () => {
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

      await repository.save(operation1);
      await repository.save(operation2);
      await repository.save(operation3);

      const operationsForAccount = await repository.findByAccount('Conta Principal');
      expect(operationsForAccount).toHaveLength(2);
      expect(operationsForAccount).toContainEqual(operation1);
      expect(operationsForAccount).toContainEqual(operation2);
      expect(operationsForAccount).not.toContainEqual(operation3);
    });
  });

  describe('findByCategory', () => {
    it('should return operations for specific category', async () => {
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

      await repository.save(operation1);
      await repository.save(operation2);
      await repository.save(operation3);

      const alimentacaoOperations = await repository.findByCategory('Alimentação');
      expect(alimentacaoOperations).toHaveLength(2);
      expect(alimentacaoOperations).toContainEqual(operation1);
      expect(alimentacaoOperations).toContainEqual(operation2);
      expect(alimentacaoOperations).not.toContainEqual(operation3);
    });
  });

  describe('delete', () => {
    it('should delete operation and return true', async () => {
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

      await repository.save(operation);
      const deleted = await repository.delete('op-1');
      expect(deleted).toBe(true);

      const found = await repository.findById('op-1');
      expect(found).toBeNull();
    });

    it('should return false when operation does not exist', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of operations', async () => {
      expect(await repository.count()).toBe(0);

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

      await repository.save(operation1);
      expect(await repository.count()).toBe(1);

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

      await repository.save(operation2);
      expect(await repository.count()).toBe(2);
    });
  });
}); 