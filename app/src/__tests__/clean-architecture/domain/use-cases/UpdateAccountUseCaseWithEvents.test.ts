import { UpdateAccountUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateAccountUseCase';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateAccountUseCase with Events', () => {
  let useCase: UpdateAccountUseCase;
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

    useCase = new UpdateAccountUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish AccountUpdated event when account is updated successfully', async () => {
      // Arrange
      const existingAccount = new Account({
        id: 'acc_123',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
      });

      const request = {
        id: 'acc_123',
        name: 'Conta Corrente Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500),
        description: 'Conta principal atualizada',
        color: '#34C759',
      };

      const updatedAccount = new Account({
        id: 'acc_123',
        name: 'Conta Corrente Atualizada',
        type: 'corrente',
        balance: new Money(1500),
        description: 'Conta principal atualizada',
        color: '#34C759',
      });

      mockRepository.findById.mockResolvedValue(existingAccount);
      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(updatedAccount);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('acc_123');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Account));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'AccountUpdated',
        expect.objectContaining({
          type: 'AccountUpdated',
          data: updatedAccount,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when account update fails', async () => {
      // Arrange
      const request = {
        id: 'acc_123',
        name: 'Conta Corrente Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500),
        description: 'Conta principal atualizada',
        color: '#34C759',
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
      const existingAccount = new Account({
        id: 'acc_123',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
      });

      const request = {
        id: 'acc_123',
        name: '', // Invalid name
        type: 'corrente' as const,
        balance: new Money(1500),
        description: 'Conta principal atualizada',
        color: '#34C759',
      };

      mockRepository.findById.mockResolvedValue(existingAccount);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct updated account data', async () => {
      // Arrange
      const existingAccount = new Account({
        id: 'acc_456',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(5000),
        description: 'Conta de poupança',
        color: '#34C759',
      });

      const request = {
        id: 'acc_456',
        name: 'Conta Poupança Atualizada',
        type: 'poupanca' as const,
        balance: new Money(6000),
        description: 'Conta de poupança atualizada',
        color: '#FF9500',
      };

      const updatedAccount = new Account({
        id: 'acc_456',
        name: 'Conta Poupança Atualizada',
        type: 'poupanca',
        balance: new Money(6000),
        description: 'Conta de poupança atualizada',
        color: '#FF9500',
      });

      mockRepository.findById.mockResolvedValue(existingAccount);
      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(updatedAccount);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('AccountUpdated');
      expect(publishedEvent.data).toBe(updatedAccount);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
}); 