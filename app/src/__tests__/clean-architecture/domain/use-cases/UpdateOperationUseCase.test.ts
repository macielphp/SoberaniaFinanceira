// Tests for UpdateOperationUseCase
import { UpdateOperationUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateOperationUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { Operation, OperationProps } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateOperationUseCase', () => {
  let updateOperationUseCase: UpdateOperationUseCase;
  let mockOperationRepository: jest.Mocked<IOperationRepository>;
  let mockOperation: Operation;
  let updatedOperation: Operation;

  beforeEach(() => {
    mockOperationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByDateRange: jest.fn(),
      findByCategory: jest.fn(),
      findByAccount: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    updateOperationUseCase = new UpdateOperationUseCase(mockOperationRepository);

    mockOperation = new Operation({
      id: '1',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Pix',
      sourceAccount: 'conta-1',
      destinationAccount: 'conta-2',
      date: new Date('2024-01-15'),
      value: new Money(100, 'BRL'),
      category: 'Alimentação',
      details: 'Compra no supermercado',
      project: 'projeto-1',
    });

    // Mock da operação atualizada
    updatedOperation = new Operation({
      id: '1',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão de crédito',
      sourceAccount: 'conta-1',
      destinationAccount: 'conta-2',
      date: new Date('2024-01-15'),
      value: new Money(150, 'BRL'),
      category: 'Alimentação',
      details: 'Compra no supermercado atualizada',
      project: 'projeto-1',
    });
  });

  describe('execute', () => {
    it('should update an existing operation successfully', async () => {
      // Arrange
      const operationId = '1';
      const updateData: Partial<OperationProps> = {
        paymentMethod: 'Cartão de crédito',
        value: new Money(150, 'BRL'),
        details: 'Compra no supermercado atualizada',
      };

      mockOperationRepository.findById.mockResolvedValue(mockOperation);
      mockOperationRepository.save.mockResolvedValue(updatedOperation);

      // Act
      const result = await updateOperationUseCase.execute(operationId, updateData);

      // Assert
      expect(mockOperationRepository.findById).toHaveBeenCalledWith(operationId);
      expect(mockOperationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: operationId,
          paymentMethod: 'Cartão de crédito',
          value: new Money(150, 'BRL'),
          details: 'Compra no supermercado atualizada',
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(operationId);
      expect(result.paymentMethod).toBe('Cartão de crédito');
      expect(result.value.value).toBe(150);
    });

    it('should throw error when operation is not found', async () => {
      // Arrange
      const operationId = '999';
      const updateData: Partial<OperationProps> = {
        details: 'Operação Inexistente',
      };

      mockOperationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateOperationUseCase.execute(operationId, updateData))
        .rejects
        .toThrow('Operation not found');

      expect(mockOperationRepository.findById).toHaveBeenCalledWith(operationId);
      expect(mockOperationRepository.save).not.toHaveBeenCalled();
    });

    it('should validate operation data before updating', async () => {
      // Arrange
      const operationId = '1';
      const invalidUpdateData: Partial<OperationProps> = {
        paymentMethod: 'Método Inválido' as any, // Método de pagamento inválido
      };

      mockOperationRepository.findById.mockResolvedValue(mockOperation);

      // Act & Assert
      await expect(updateOperationUseCase.execute(operationId, invalidUpdateData))
        .rejects
        .toThrow('Invalid payment method');

      expect(mockOperationRepository.findById).toHaveBeenCalledWith(operationId);
      expect(mockOperationRepository.save).not.toHaveBeenCalled();
    });

    it('should preserve existing properties when updating partial data', async () => {
      // Arrange
      const operationId = '1';
      const updateData: Partial<OperationProps> = {
        details: 'Novos detalhes da operação',
      };

      const partiallyUpdatedOperation = new Operation({
        id: '1',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Pix',
        sourceAccount: 'conta-1',
        destinationAccount: 'conta-2',
        date: new Date('2024-01-15'),
        value: new Money(100, 'BRL'),
        category: 'Alimentação',
        details: 'Novos detalhes da operação',
        project: 'projeto-1',
      });

      mockOperationRepository.findById.mockResolvedValue(mockOperation);
      mockOperationRepository.save.mockResolvedValue(partiallyUpdatedOperation);

      // Act
      const result = await updateOperationUseCase.execute(operationId, updateData);

      // Assert
      expect(result.details).toBe('Novos detalhes da operação');
      expect(result.value.value).toBe(100); // Preservado
      expect(result.paymentMethod).toBe('Pix'); // Preservado
      expect(result.state).toBe('pago'); // Preservado
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const operationId = '1';
      const updateData: Partial<OperationProps> = {
        details: 'Test Operation',
      };

      mockOperationRepository.findById.mockResolvedValue(mockOperation);
      mockOperationRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(updateOperationUseCase.execute(operationId, updateData))
        .rejects
        .toThrow('Database error');
    });
  });
}); 