import { DeleteOperationUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteOperationUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('DeleteOperationUseCase with Events', () => {
  let useCase: DeleteOperationUseCase;
  let mockRepository: jest.Mocked<IOperationRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByDateRange: jest.fn(),
      findByAccount: jest.fn(),
      findByCategory: jest.fn(),
      count: jest.fn(),
    };

    mockEventBus = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      clear: jest.fn(),
      getHandlerCount: jest.fn(),
      hasHandlers: jest.fn(),
      getEventNames: jest.fn(),
    } as unknown as jest.Mocked<EventBus>;

    useCase = new DeleteOperationUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish OperationDeleted event when operation is deleted successfully', async () => {
      // Arrange
      const operationId = 'op_123';
      const existingOperation = new Operation({
        id: operationId,
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        project: 'default',
      });

      mockRepository.findById.mockResolvedValue(existingOperation);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute({ id: operationId });

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(operationId);
      expect(mockRepository.delete).toHaveBeenCalledWith(operationId);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'OperationDeleted',
        expect.objectContaining({
          type: 'OperationDeleted',
          data: { operationId },
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when operation deletion fails', async () => {
      // Arrange
      const operationId = 'op_123';

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute({ id: operationId });

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when operation is not found', async () => {
      // Arrange
      const operationId = 'op_123';

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute({ id: operationId });

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct operation ID', async () => {
      // Arrange
      const operationId = 'op_456';
      const existingOperation = new Operation({
        id: operationId,
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date('2024-01-15'),
        value: new Money(500),
        category: 'category2',
        details: 'Aluguel',
        project: 'default',
      });

      mockRepository.findById.mockResolvedValue(existingOperation);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute({ id: operationId });

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('OperationDeleted');
      expect(publishedEvent.data.operationId).toBe(operationId);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });

    it('should not publish event when delete operation returns false', async () => {
      // Arrange
      const operationId = 'op_123';
      const existingOperation = new Operation({
        id: operationId,
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        project: 'default',
      });

      mockRepository.findById.mockResolvedValue(existingOperation);
      mockRepository.delete.mockResolvedValue(false);

      // Act
      const result = await useCase.execute({ id: operationId });

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });
}); 