import { DeleteGoalUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('DeleteGoalUseCase with Events', () => {
  let useCase: DeleteGoalUseCase;
  let mockRepository: jest.Mocked<IGoalRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      findActive: jest.fn(),
      findByDateRange: jest.fn(),
      count: jest.fn(),
      countByUserId: jest.fn(),
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

    useCase = new DeleteGoalUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish GoalDeleted event when goal is deleted successfully', async () => {
      // Arrange
      const existingGoal = new Goal({
        id: 'goal_123',
        userId: 'user_123',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute('goal_123');

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match((response) => response.deleted, () => false)).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('goal_123');
      expect(mockRepository.delete).toHaveBeenCalledWith('goal_123');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'GoalDeleted',
        expect.objectContaining({
          type: 'GoalDeleted',
          data: { goalId: 'goal_123' },
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when goal deletion fails', async () => {
      // Arrange
      const existingGoal = new Goal({
        id: 'goal_123',
        userId: 'user_123',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute('goal_123');

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when goal is not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute('goal_999');

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match((response) => response.deleted, () => false)).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when goal deletion returns false', async () => {
      // Arrange
      const existingGoal = new Goal({
        id: 'goal_123',
        userId: 'user_123',
        description: 'Comprar Carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.delete.mockResolvedValue(false);

      // Act
      const result = await useCase.execute('goal_123');

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match((response) => response.deleted, () => false)).toBe(false);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when validation fails', async () => {
      // Arrange
      const goalId = ''; // Invalid goal ID

      // Act
      const result = await useCase.execute(goalId);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct goal ID', async () => {
      // Arrange
      const existingGoal = new Goal({
        id: 'goal_456',
        userId: 'user_456',
        description: 'Viagem para Europa',
        type: 'economia',
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-06-30'),
        monthlyIncome: new Money(12000, 'BRL'),
        fixedExpenses: new Money(4000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(2000, 'BRL'),
        numParcela: 18,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute('goal_456');

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('GoalDeleted');
      expect(publishedEvent.data.goalId).toBe('goal_456');
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
});
