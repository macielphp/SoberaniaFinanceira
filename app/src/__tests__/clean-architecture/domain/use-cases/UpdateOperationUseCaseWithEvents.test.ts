import { UpdateOperationUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateOperationUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateOperationUseCase with Events', () => {
  let useCase: UpdateOperationUseCase;
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

    useCase = new UpdateOperationUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish OperationUpdated event when operation is updated successfully', async () => {
      // Arrange
      const existingOperation = new Operation({
        id: 'op_123',
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

      const request = {
        id: 'op_123',
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1500),
        category: 'category1',
        details: 'Salário atualizado',
        project: 'default',
      };

      const updatedOperation = new Operation({
        id: 'op_123',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1500),
        category: 'category1',
        details: 'Salário atualizado',
        project: 'default',
      });

      mockRepository.findById.mockResolvedValue(existingOperation);
      mockRepository.save.mockResolvedValue(updatedOperation);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('op_123');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Operation));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'OperationUpdated',
        expect.objectContaining({
          type: 'OperationUpdated',
          data: updatedOperation,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when operation update fails', async () => {
      // Arrange
      const request = {
        id: 'op_123',
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1500),
        category: 'category1',
        details: 'Salário atualizado',
        project: 'default',
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when validation fails', async () => {
      // Arrange
      const existingOperation = new Operation({
        id: 'op_123',
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

      const request = {
        id: 'op_123',
        nature: 'receita' as const,
        state: 'pago' as const, // Invalid state for receita
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1500),
        category: 'category1',
        details: 'Salário atualizado',
        project: 'default',
      };

      mockRepository.findById.mockResolvedValue(existingOperation);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct updated operation data', async () => {
      // Arrange
      const existingOperation = new Operation({
        id: 'op_456',
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

      const request = {
        id: 'op_456',
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date('2024-01-15'),
        value: new Money(600),
        category: 'category2',
        details: 'Aluguel atualizado',
        project: 'default',
      };

      const updatedOperation = new Operation({
        id: 'op_456',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date('2024-01-15'),
        value: new Money(600),
        category: 'category2',
        details: 'Aluguel atualizado',
        project: 'default',
      });

      mockRepository.findById.mockResolvedValue(existingOperation);
      mockRepository.save.mockResolvedValue(updatedOperation);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('OperationUpdated');
      expect(publishedEvent.data).toBe(updatedOperation);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
}); 