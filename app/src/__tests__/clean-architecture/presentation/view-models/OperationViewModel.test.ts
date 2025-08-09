import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Account } from '../../../../clean-architecture/domain/entities/Account';

// Mock dos Use Cases
const mockCreateOperationUseCase = {
  execute: jest.fn(),
};

const mockUpdateOperationUseCase = {
  execute: jest.fn(),
};

const mockGetOperationByIdUseCase = {
  execute: jest.fn(),
};

const mockGetOperationsUseCase = {
  execute: jest.fn(),
};

describe('OperationViewModel', () => {
  let operationViewModel: OperationViewModel;
  let mockOperation: Operation;
  let mockCategory: Category;
  let mockAccount: Account;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock data
    mockCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
    });

    mockAccount = new Account({
      id: '1',
      name: 'Conta Principal',
      type: 'corrente',
      balance: new Money(1000, 'BRL'),
    });

    mockOperation = new Operation({
      id: '1',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão de débito',
      sourceAccount: 'Conta Principal',
      destinationAccount: 'Conta Principal',
      date: new Date('2024-01-15'),
      value: new Money(25.50, 'BRL'),
      category: 'Alimentação',
      details: 'Almoço no restaurante',
    });

    operationViewModel = new OperationViewModel(
      mockCreateOperationUseCase,
      mockUpdateOperationUseCase,
      mockGetOperationByIdUseCase,
      mockGetOperationsUseCase
    );
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(operationViewModel.operation).toBeNull();
      expect(operationViewModel.isLoading).toBe(false);
      expect(operationViewModel.error).toBeNull();
      expect(operationViewModel.isEditing).toBe(false);
    });
  });

  describe('setOperation', () => {
    it('should set operation and update editing state', () => {
      operationViewModel.setOperation(mockOperation);

      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(operationViewModel.isEditing).toBe(true);
    });

    it('should set operation to null and reset editing state', () => {
      operationViewModel.setOperation(null);

      expect(operationViewModel.operation).toBeNull();
      expect(operationViewModel.isEditing).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      operationViewModel.setLoading(true);
      expect(operationViewModel.isLoading).toBe(true);

      operationViewModel.setLoading(false);
      expect(operationViewModel.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Erro ao salvar operação';
      operationViewModel.setError(errorMessage);
      expect(operationViewModel.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      operationViewModel.setError('Erro anterior');
      operationViewModel.setError(null);
      expect(operationViewModel.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Setup some state
      operationViewModel.setOperation(mockOperation);
      operationViewModel.setLoading(true);
      operationViewModel.setError('Erro');

      operationViewModel.reset();

      expect(operationViewModel.operation).toBeNull();
      expect(operationViewModel.isLoading).toBe(false);
      expect(operationViewModel.error).toBeNull();
      expect(operationViewModel.isEditing).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('should return true for valid operation data', () => {
      const validData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      const result = operationViewModel.validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return false for invalid nature', () => {
      const invalidData = {
        nature: '' as any,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      const result = operationViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.nature).toBe('Natureza é obrigatória');
    });

    it('should return false for invalid value', () => {
      const invalidData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(0, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      const result = operationViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.value).toBe('Valor deve ser maior que zero');
    });

    it('should return false for missing category', () => {
      const invalidData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: '',
        details: 'Almoço no restaurante',
      };

      const result = operationViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.category).toBe('Categoria é obrigatória');
    });

    it('should return false for missing source account', () => {
      const invalidData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: '',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      const result = operationViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.sourceAccount).toBe('Conta de origem é obrigatória');
    });
  });

  describe('createOperation', () => {
    it('should create operation successfully', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      mockCreateOperationUseCase.execute.mockResolvedValue(mockOperation);

      const result = await operationViewModel.createOperation(operationData);

      expect(mockCreateOperationUseCase.execute).toHaveBeenCalledWith(operationData);
      expect(result).toEqual(mockOperation);
      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(operationViewModel.isEditing).toBe(true);
    });

    it('should handle creation error', async () => {
      const operationData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de débito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(25.50, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço no restaurante',
      };

      const error = new Error('Erro ao criar operação');
      mockCreateOperationUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.createOperation(operationData)).rejects.toThrow('Erro ao criar operação');
    });
  });

  describe('updateOperation', () => {
    it('should update operation successfully', async () => {
      operationViewModel.setOperation(mockOperation);

      const updatedData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(30.00, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço atualizado',
      };

      const updatedOperation = new Operation({
        id: mockOperation.id,
        ...updatedData,
      });

      mockUpdateOperationUseCase.execute.mockResolvedValue(updatedOperation);

      const result = await operationViewModel.updateOperation(updatedData);

      expect(mockUpdateOperationUseCase.execute).toHaveBeenCalledWith(mockOperation.id, updatedData);
      expect(result).toEqual(updatedOperation);
      expect(operationViewModel.operation).toEqual(updatedOperation);
    });

    it('should handle update error', async () => {
      operationViewModel.setOperation(mockOperation);

      const updatedData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(30.00, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço atualizado',
      };

      const error = new Error('Erro ao atualizar operação');
      mockUpdateOperationUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.updateOperation(updatedData)).rejects.toThrow('Erro ao atualizar operação');
    });

    it('should throw error when no operation is set', async () => {
      const updatedData = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-15'),
        value: new Money(30.00, 'BRL'),
        category: 'Alimentação',
        details: 'Almoço atualizado',
      };

      await expect(operationViewModel.updateOperation(updatedData)).rejects.toThrow('Nenhuma operação selecionada para edição');
    });
  });

  describe('loadOperation', () => {
    it('should load operation successfully', async () => {
      const operationId = '1';
      mockGetOperationByIdUseCase.execute.mockResolvedValue(mockOperation);

      const result = await operationViewModel.loadOperation(operationId);

      expect(mockGetOperationByIdUseCase.execute).toHaveBeenCalledWith(operationId);
      expect(result).toEqual(mockOperation);
      expect(operationViewModel.operation).toEqual(mockOperation);
      expect(operationViewModel.isEditing).toBe(true);
    });

    it('should handle load error', async () => {
      const operationId = '1';
      const error = new Error('Operação não encontrada');
      mockGetOperationByIdUseCase.execute.mockRejectedValue(error);

      await expect(operationViewModel.loadOperation(operationId)).rejects.toThrow('Operação não encontrada');
    });
  });

  describe('formatAmount', () => {
    it('should format amount correctly', () => {
      const amount = new Money(1234.56, 'BRL');
      const formatted = operationViewModel.formatAmount(amount);
      expect(formatted).toMatch(/R\$\s*1\.234,56/);
    });

    it('should handle zero amount', () => {
      const amount = new Money(0, 'BRL');
      const formatted = operationViewModel.formatAmount(amount);
      expect(formatted).toMatch(/R\$\s*0,00/);
    });
  });

  describe('getOperationSummary', () => {
    it('should return operation summary when operation exists', () => {
      operationViewModel.setOperation(mockOperation);

      const summary = operationViewModel.getOperationSummary();

      expect(summary).toMatchObject({
        id: '1',
        description: 'Almoço no restaurante',
        type: 'despesa',
        categoryName: 'Alimentação',
        accountName: 'Conta Principal',
        date: '14/01/2024',
        isRecurring: false,
        installments: 1,
        currentInstallment: 1,
      });
      expect(summary?.amount).toMatch(/R\$\s*25,50/);
    });

    it('should return null when no operation is set', () => {
      const summary = operationViewModel.getOperationSummary();
      expect(summary).toBeNull();
    });
  });

  describe('loadOperations', () => {
    it('should load operations successfully and update state', async () => {
      // Arrange
      const mockOperations = [mockOperation];
      const successResult = {
        match: jest.fn((onSuccess, onError) => onSuccess({ operations: mockOperations }))
      };
      mockGetOperationsUseCase.execute.mockResolvedValue(successResult);

      // Act
      const result = await operationViewModel.loadOperations();

      // Assert
      expect(mockGetOperationsUseCase.execute).toHaveBeenCalledWith({});
      expect(operationViewModel.operations).toEqual(mockOperations);
      expect(operationViewModel.error).toBeNull();
      expect(result).toEqual(mockOperations);
    });

    it('should handle errors when loading operations fails', async () => {
      // Arrange
      const errorMessage = 'Erro ao carregar operações';
      const errorResult = {
        match: jest.fn((onSuccess, onError) => onError(new Error(errorMessage)))
      };
      mockGetOperationsUseCase.execute.mockResolvedValue(errorResult);

      // Act & Assert
      await expect(operationViewModel.loadOperations()).rejects.toThrow(errorMessage);
      expect(operationViewModel.error).toBe(errorMessage);
      expect(operationViewModel.operations).toEqual([]);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const errorMessage = 'Unexpected error';
      mockGetOperationsUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(operationViewModel.loadOperations()).rejects.toThrow(errorMessage);
      expect(operationViewModel.error).toBe(errorMessage);
    });

    it('should set loading state correctly during operation', async () => {
      // Arrange
      let loadingDuringExecution = false;
      const successResult = {
        match: jest.fn((onSuccess, onError) => {
          loadingDuringExecution = operationViewModel.isLoading;
          return onSuccess({ operations: [] });
        })
      };
      mockGetOperationsUseCase.execute.mockResolvedValue(successResult);

      // Act
      await operationViewModel.loadOperations();

      // Assert
      expect(loadingDuringExecution).toBe(true);
      expect(operationViewModel.isLoading).toBe(false);
    });
  });
});
