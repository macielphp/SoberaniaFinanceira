import { renderHook, act } from '@testing-library/react-native';
import { useOperationAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useOperationAdapter';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('useOperationAdapter', () => {
  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useOperationAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.operation).toBeNull();
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('createOperation', () => {
    it('should create operation successfully', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'account-1',
        destinationAccount: 'account-external',
        date: new Date(),
        value: new Money(150),
        category: 'category-1',
        details: 'Compras da semana',
      };

      const { result } = renderHook(() => useOperationAdapter());

      let createdOperation;
      await act(async () => {
        createdOperation = await result.current.createOperation(operationData);
      });

      expect(createdOperation).toBeDefined();
      expect(result.current.operation).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('updateOperation', () => {
    it('should update operation successfully', async () => {
      const { result } = renderHook(() => useOperationAdapter());

      // First set an operation
      const initialOperation = new Operation({
        id: 'operation-1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account-external',
        destinationAccount: 'account-1',
        date: new Date(),
        value: new Money(5000),
        category: 'category-1',
        details: 'Salário inicial',
      });

      act(() => {
        result.current.setOperation(initialOperation);
      });

      const updateData = {
        value: new Money(5500),
        details: 'Salário Atualizado',
      };

      let updatedOperation;
      await act(async () => {
        updatedOperation = await result.current.updateOperation(updateData);
      });

      expect(updatedOperation).toBeDefined();
      expect(result.current.operation).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadOperation', () => {
    it('should load operation by id successfully', async () => {
      const operationId = 'operation-1';

      const { result } = renderHook(() => useOperationAdapter());

      let loadedOperation;
      await act(async () => {
        loadedOperation = await result.current.loadOperation(operationId);
      });

      expect(loadedOperation).toBeDefined();
      expect(result.current.operation).toBeDefined();
      expect(result.current.operation?.id).toBe(operationId);
    });
  });

  describe('setOperation', () => {
    it('should set operation and update editing state', () => {
      const operation = new Operation({
        id: 'operation-1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account-external',
        destinationAccount: 'account-1',
        date: new Date(),
        value: new Money(5000),
        category: 'category-1',
        details: 'Salário',
      });

      const { result } = renderHook(() => useOperationAdapter());

      act(() => {
        result.current.setOperation(operation);
      });

      expect(result.current.operation).toEqual(operation);
      expect(result.current.isEditing).toBe(true);
    });

    it('should clear operation when set to null', () => {
      const { result } = renderHook(() => useOperationAdapter());

      act(() => {
        result.current.setOperation(null);
      });

      expect(result.current.operation).toBeNull();
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useOperationAdapter());

      // First set some state
      const operation = new Operation({
        id: 'operation-1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account-external',
        destinationAccount: 'account-1',
        date: new Date(),
        value: new Money(5000),
        category: 'category-1',
        details: 'Salário',
      });

      act(() => {
        result.current.setOperation(operation);
        result.current.setError('Some error');
      });

      expect(result.current.operation).toBeDefined();
      expect(result.current.error).toBe('Some error');

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.operation).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isEditing).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate form data', () => {
      const validData = {
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account-1',
        destinationAccount: 'account-2',
        date: new Date(),
        value: new Money(100),
        category: 'category-1',
        details: 'Valid operation',
      };

      const { result } = renderHook(() => useOperationAdapter());

      const validation = result.current.validateForm(validData);

      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        nature: '' as any,
        state: '' as any,
        paymentMethod: '' as any,
        sourceAccount: '',
        destinationAccount: '',
        date: new Date(),
        value: new Money(0),
        category: '',
        details: '',
      };

      const { result } = renderHook(() => useOperationAdapter());

      const validation = result.current.validateForm(invalidData);

      expect(validation.isValid).toBe(false);
      expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
    });
  });

  describe('formatting and summary', () => {
    it('should format amount correctly', () => {
      const amount = new Money(1234.56);

      const { result } = renderHook(() => useOperationAdapter());

      const formatted = result.current.formatAmount(amount);

      expect(formatted).toMatch(/R\$\s*1\.234,56/);
    });

    it('should get operation summary', () => {
      const operation = new Operation({
        id: 'operation-1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account-external',
        destinationAccount: 'account-1',
        date: new Date(),
        value: new Money(5000),
        category: 'category-1',
        details: 'Salário',
      });

      const { result } = renderHook(() => useOperationAdapter());

      act(() => {
        result.current.setOperation(operation);
      });

      const summary = result.current.getOperationSummary();

      expect(summary).toBeDefined();
      expect(summary.id).toBe('operation-1');
      expect(summary.type).toBe('receita');
    });

    it('should return null summary when no operation set', () => {
      const { result } = renderHook(() => useOperationAdapter());

      const summary = result.current.getOperationSummary();

      expect(summary).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useOperationAdapter());

      act(() => {
        result.current.setError('Some error');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useOperationAdapter());

      act(() => {
        result.current.setError('Custom error');
      });

      expect(result.current.error).toBe('Custom error');
    });
  });
});