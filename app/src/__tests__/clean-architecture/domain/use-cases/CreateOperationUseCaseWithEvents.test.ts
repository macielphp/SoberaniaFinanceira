import { CreateOperationUseCase } from '../../../../clean-architecture/domain/use-cases/CreateOperationUseCase';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('CreateOperationUseCase with Events', () => {
  let useCase: CreateOperationUseCase;
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

    useCase = new CreateOperationUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish OperationCreated event when operation is created successfully', async () => {
      // Arrange
      const request = {
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        project: 'default',
      };

      const savedOperation = new Operation({
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

      mockRepository.save.mockResolvedValue(savedOperation);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Operation));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'OperationCreated',
        expect.objectContaining({
          type: 'OperationCreated',
          data: savedOperation,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when operation creation fails', async () => {
      // Arrange
      const request = {
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        project: 'default',
      };

      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when validation fails', async () => {
      // Arrange
      const request = {
        nature: 'receita' as const,
        state: 'pago' as const, // Invalid state for receita
        paymentMethod: 'Pix' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date(),
        value: new Money(1000),
        category: 'category1',
        details: 'Salário',
        project: 'default',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct operation data', async () => {
      // Arrange
      const request = {
        nature: 'despesa' as const,
        state: 'pago' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'account1',
        destinationAccount: 'account2',
        date: new Date('2024-01-15'),
        value: new Money(500),
        category: 'category2',
        details: 'Aluguel',
        project: 'default',
      };

      const savedOperation = new Operation({
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

      mockRepository.save.mockResolvedValue(savedOperation);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('OperationCreated');
      expect(publishedEvent.data).toBe(savedOperation);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
}); 