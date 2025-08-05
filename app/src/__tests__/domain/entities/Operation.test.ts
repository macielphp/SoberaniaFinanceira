// Tests for Operation Entity
import { Operation } from '../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Operation Entity', () => {
  describe('constructor', () => {
    it('should create operation with valid data', () => {
      const operation = new Operation({
        id: 'test-id',
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

      expect(operation.id).toBe('test-id');
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
    });

    it('should create operation with minimal required data', () => {
      const operation = new Operation({
        id: 'test-id',
        nature: 'receita',
        state: 'receber',
        paymentMethod: 'Pix',
        sourceAccount: 'Cliente',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(1000, 'BRL'),
        category: 'Vendas'
      });

      expect(operation.id).toBe('test-id');
      expect(operation.nature).toBe('receita');
      expect(operation.state).toBe('receber');
      expect(operation.details).toBeUndefined();
      expect(operation.project).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should throw error for invalid nature', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'invalid' as any,
          state: 'pagar',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('Invalid nature: invalid');
    });

    it('should throw error for invalid state', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'invalid' as any,
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('Invalid state: invalid');
    });

    it('should throw error for invalid payment method', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pagar',
          paymentMethod: 'Invalid Method' as any,
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('Invalid payment method: Invalid Method');
    });

    it('should throw error for empty source account', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pagar',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: '',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('Source account cannot be empty');
    });

    it('should throw error for empty destination account', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pagar',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: '',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('Destination account cannot be empty');
    });

    it('should throw error for empty category', () => {
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pagar',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: ''
        });
      }).toThrow('Category cannot be empty');
    });
  });

  describe('business rules', () => {
    it('should validate state compatibility with nature', () => {
      // Receita com estado de despesa deve falhar
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'receita',
          state: 'pagar',
          paymentMethod: 'Pix',
          sourceAccount: 'Cliente',
          destinationAccount: 'Conta Principal',
          date: new Date('2024-01-15'),
          value: new Money(1000, 'BRL'),
          category: 'Vendas'
        });
      }).toThrow('State "pagar" is not compatible with nature "receita"');

      // Despesa com estado de receita deve falhar
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'receber',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).toThrow('State "receber" is not compatible with nature "despesa"');
    });

    it('should allow valid state-nature combinations', () => {
      // Receita com estados válidos
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'receita',
          state: 'receber',
          paymentMethod: 'Pix',
          sourceAccount: 'Cliente',
          destinationAccount: 'Conta Principal',
          date: new Date('2024-01-15'),
          value: new Money(1000, 'BRL'),
          category: 'Vendas'
        });
      }).not.toThrow();

      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Pix',
          sourceAccount: 'Cliente',
          destinationAccount: 'Conta Principal',
          date: new Date('2024-01-15'),
          value: new Money(1000, 'BRL'),
          category: 'Vendas'
        });
      }).not.toThrow();

      // Despesa com estados válidos
      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pagar',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).not.toThrow();

      expect(() => {
        new Operation({
          id: 'test-id',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Cartão de crédito',
          sourceAccount: 'Conta Principal',
          destinationAccount: 'Fornecedor',
          date: new Date('2024-01-15'),
          value: new Money(500, 'BRL'),
          category: 'Alimentação'
        });
      }).not.toThrow();
    });
  });

  describe('methods', () => {
    it('should check if operation is completed', () => {
      const pendingOperation = new Operation({
        id: 'test-id',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      const completedOperation = new Operation({
        id: 'test-id',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      expect(pendingOperation.isCompleted()).toBe(false);
      expect(completedOperation.isCompleted()).toBe(true);
    });

    it('should check if operation is pending', () => {
      const pendingOperation = new Operation({
        id: 'test-id',
        nature: 'despesa',
        state: 'pagar',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      const completedOperation = new Operation({
        id: 'test-id',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Fornecedor',
        date: new Date('2024-01-15'),
        value: new Money(500, 'BRL'),
        category: 'Alimentação'
      });

      expect(pendingOperation.isPending()).toBe(true);
      expect(completedOperation.isPending()).toBe(false);
    });


  });
}); 