import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('OperationViewModel', () => {
  let operationViewModel: OperationViewModel;
  let mockCreateOperationUseCase: jest.Mocked<any>;
  let mockUpdateOperationUseCase: jest.Mocked<any>;
  let mockGetOperationByIdUseCase: jest.Mocked<any>;
  let mockGetOperationsUseCase: jest.Mocked<any>;
  let mockDeleteOperationUseCase: jest.Mocked<any>;

  const mockOperation = new Operation({
    id: '1',
    nature: 'receita',
    state: 'recebido',
    paymentMethod: 'Pix',
    sourceAccount: 'Conta Principal',
    destinationAccount: 'Conta Secundária',
    date: new Date('2024-01-01'),
    value: new Money(100, 'BRL'),
    category: 'Salário',
    details: 'Test operation'
  });

  beforeEach(() => {
    mockCreateOperationUseCase = {
      execute: jest.fn()
    };

    mockUpdateOperationUseCase = {
      execute: jest.fn()
    };

    mockGetOperationByIdUseCase = {
      execute: jest.fn()
    };

    mockGetOperationsUseCase = {
      execute: jest.fn()
    };

    mockDeleteOperationUseCase = {
      execute: jest.fn()
    };

    operationViewModel = new OperationViewModel(
      mockCreateOperationUseCase,
      mockUpdateOperationUseCase,
      mockGetOperationByIdUseCase,
      mockGetOperationsUseCase,
      mockDeleteOperationUseCase
    );
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(operationViewModel.operation).toBeNull();
      expect(operationViewModel.operations).toEqual([]);
      expect(operationViewModel.isLoading).toBe(false);
      expect(operationViewModel.error).toBeNull();
      expect(operationViewModel.isEditing).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set operation correctly', () => {
      operationViewModel.setOperation(mockOperation);

      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(operationViewModel.isEditing).toBe(true);
    });

    it('should set loading state', () => {
      operationViewModel.setLoading(true);
      expect(operationViewModel.isLoading).toBe(true);

      operationViewModel.setLoading(false);
      expect(operationViewModel.isLoading).toBe(false);
    });

    it('should set error', () => {
      const errorMessage = 'Test error';
      operationViewModel.setError(errorMessage);
      expect(operationViewModel.error).toBe(errorMessage);

      operationViewModel.setError(null);
      expect(operationViewModel.error).toBeNull();
    });

    it('should reset state', () => {
      operationViewModel.setOperation(mockOperation);
      operationViewModel.setLoading(true);
      operationViewModel.setError('Test error');

      operationViewModel.reset();

      expect(operationViewModel.operation).toBeNull();
      expect(operationViewModel.isLoading).toBe(false);
      expect(operationViewModel.error).toBeNull();
      expect(operationViewModel.isEditing).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should validate valid form data', () => {
      const validData = {
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date(),
        value: new Money(100, 'BRL'),
        category: 'Salário'
      };

      const result = operationViewModel.validateForm(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate invalid form data', () => {
      const invalidData = {
        nature: '' as any,
        state: '' as any,
        paymentMethod: '' as any,
        sourceAccount: '',
        destinationAccount: '',
        date: new Date(),
        value: new Money(0, 'BRL'),
        category: ''
      };

      const result = operationViewModel.validateForm(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('nature');
      expect(result.errors).toHaveProperty('state');
      expect(result.errors).toHaveProperty('paymentMethod');
      expect(result.errors).toHaveProperty('sourceAccount');
      expect(result.errors).toHaveProperty('destinationAccount');
      expect(result.errors).toHaveProperty('value');
      expect(result.errors).toHaveProperty('category');
    });
  });

  describe('createOperation', () => {
    it('should create operation successfully', async () => {
      mockCreateOperationUseCase.execute.mockResolvedValue(mockOperation);

      const result = await operationViewModel.createOperation({
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date(),
        value: new Money(100, 'BRL'),
        category: 'Salário'
      });

      expect(result).toEqual(mockOperation);
      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(mockCreateOperationUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle create operation error', async () => {
      const error = new Error('Create operation failed');
      mockCreateOperationUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.createOperation({
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date(),
        value: new Money(100, 'BRL'),
        category: 'Salário'
      })).rejects.toThrow('Create operation failed');

      expect(operationViewModel.error).toBe('Create operation failed');
    });
  });

  describe('updateOperation', () => {
    it('should update operation successfully', async () => {
      operationViewModel.setOperation(mockOperation);
      const updatedOperation = { ...mockOperation, details: 'Updated details' };
      mockUpdateOperationUseCase.execute.mockResolvedValue(updatedOperation);

      const result = await operationViewModel.updateOperation({
        details: 'Updated details'
      });

      expect(result).toEqual(updatedOperation);
      expect(operationViewModel.operation).toEqual(updatedOperation);
      expect(mockUpdateOperationUseCase.execute).toHaveBeenCalledWith('1', {
        details: 'Updated details'
      });
    });

    it('should throw error when no operation is selected', async () => {
      await expect(operationViewModel.updateOperation({
        details: 'Updated details'
      })).rejects.toThrow('Nenhuma operação selecionada para edição');
    });

    it('should handle update operation error', async () => {
      operationViewModel.setOperation(mockOperation);
      const error = new Error('Update operation failed');
      mockUpdateOperationUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.updateOperation({
        details: 'Updated details'
      })).rejects.toThrow('Update operation failed');

      expect(operationViewModel.error).toBe('Update operation failed');
    });
  });

  describe('loadOperation', () => {
    it('should load operation successfully', async () => {
      mockGetOperationByIdUseCase.execute.mockResolvedValue(mockOperation);

      const result = await operationViewModel.loadOperation('1');

      expect(result).toEqual(mockOperation);
      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(mockGetOperationByIdUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should handle load operation error', async () => {
      const error = new Error('Operation not found');
      mockGetOperationByIdUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.loadOperation('1')).rejects.toThrow('Operation not found');

      expect(operationViewModel.error).toBe('Operation not found');
    });
  });

  describe('loadOperations', () => {
    it('should load operations successfully', async () => {
      const mockResult = {
        match: jest.fn((successFn, errorFn) => successFn({ operations: [mockOperation] }))
      };
      mockGetOperationsUseCase.execute.mockResolvedValue(mockResult);

      const result = await operationViewModel.loadOperations();

      expect(result).toEqual([mockOperation]);
      expect(operationViewModel.operations).toEqual([mockOperation]);
      expect(mockGetOperationsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should handle load operations error', async () => {
      const mockResult = {
        match: jest.fn((successFn, errorFn) => {
          const error = { message: 'Load operations failed' };
          errorFn(error);
          throw error;
        })
      };
      mockGetOperationsUseCase.execute.mockResolvedValue(mockResult);

      try {
        await operationViewModel.loadOperations();
        fail('Expected loadOperations to throw an error');
      } catch (error) {
        expect(error).toHaveProperty('message', 'Load operations failed');
      }

      expect(operationViewModel.error).toBe('Erro ao carregar operações');
    });
  });

  describe('deleteOperation', () => {
    it('should delete operation successfully', async () => {
      operationViewModel.setOperation(mockOperation);
      const operations = [mockOperation, { ...mockOperation, id: '2' }];
      (operationViewModel as any)._operations = operations;

      await operationViewModel.deleteOperation('1');

      expect(mockDeleteOperationUseCase.execute).toHaveBeenCalledWith('1');
      expect((operationViewModel as any)._operations).toEqual([{ ...mockOperation, id: '2' }]);
      expect(operationViewModel.operation).toBeNull();
    });

    it('should delete operation without affecting current operation if different', async () => {
      const differentOperation = new Operation({
        id: '2',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: 'Test operation'
      });
      operationViewModel.setOperation(differentOperation);
      const operations = [mockOperation, differentOperation];
      (operationViewModel as any)._operations = operations;

      await operationViewModel.deleteOperation('1');

      expect(mockDeleteOperationUseCase.execute).toHaveBeenCalledWith('1');
      expect((operationViewModel as any)._operations).toEqual([differentOperation]);
      expect(operationViewModel.operation).toEqual(differentOperation);
    });

    it('should handle delete operation error', async () => {
      const error = new Error('Delete operation failed');
      mockDeleteOperationUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.deleteOperation('1')).rejects.toThrow('Delete operation failed');

      expect(operationViewModel.error).toBe('Delete operation failed');
    });
  });

  describe('formatAmount', () => {
    it('should format money amount correctly', () => {
      const money = new Money(1234.56, 'BRL');
      const formatted = operationViewModel.formatAmount(money);

      expect(formatted).toBe(money.format());
    });
  });

  describe('getOperationSummary', () => {
    it('should return operation summary when operation exists', () => {
      operationViewModel.setOperation(mockOperation);

      const summary = operationViewModel.getOperationSummary();

      expect(summary).toEqual({
        id: '1',
        description: 'Test operation',
        amount: mockOperation.value.format(),
        type: 'receita',
        categoryName: 'Salário',
        accountName: 'Conta Principal',
        date: '31/12/2023',
        isRecurring: false,
        installments: 1,
        currentInstallment: 1
      });
    });

    it('should return null when no operation is set', () => {
      const summary = operationViewModel.getOperationSummary();

      expect(summary).toBeNull();
    });

    it('should use default description when details is empty', () => {
      const operationWithoutDetails = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: ''
      });
      operationViewModel.setOperation(operationWithoutDetails);

      const summary = operationViewModel.getOperationSummary();

      expect(summary?.description).toBe('Sem descrição');
    });
  });
});
