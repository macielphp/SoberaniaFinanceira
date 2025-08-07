import { CreateAccountUseCase } from '../../../../clean-architecture/domain/use-cases/CreateAccountUseCase';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('CreateAccountUseCase with Events', () => {
  let useCase: CreateAccountUseCase;
  let mockRepository: jest.Mocked<IAccountRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
      findByName: jest.fn(),
      findActive: jest.fn(),
      count: jest.fn(),
      countActive: jest.fn(),
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

    useCase = new CreateAccountUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish AccountCreated event when account is created successfully', async () => {
      // Arrange
      const request = {
        name: 'Conta Corrente',
        type: 'corrente' as const,
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
      };

      const savedAccount = new Account({
        id: 'acc_123',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
      });

      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(savedAccount);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Account));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'AccountCreated',
        expect.objectContaining({
          type: 'AccountCreated',
          data: savedAccount,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when account creation fails', async () => {
      // Arrange
      const request = {
        name: 'Conta Corrente',
        type: 'corrente' as const,
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
        icon: 'bank',
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
        name: '', // Invalid name
        type: 'corrente' as const,
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
        icon: 'bank',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct account data', async () => {
      // Arrange
      const request = {
        name: 'Conta Poupança',
        type: 'poupanca' as const,
        balance: new Money(5000),
        description: 'Conta de poupança',
        color: '#34C759',
      };

      const savedAccount = new Account({
        id: 'acc_456',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(5000),
        description: 'Conta de poupança',
        color: '#34C759',
      });

      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(savedAccount);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('AccountCreated');
      expect(publishedEvent.data).toBe(savedAccount);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
}); 