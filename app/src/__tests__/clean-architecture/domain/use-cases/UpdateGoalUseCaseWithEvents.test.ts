import { UpdateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateGoalUseCase with Events', () => {
  let useCase: UpdateGoalUseCase;
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

    useCase = new UpdateGoalUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish GoalUpdated event when goal is updated successfully', async () => {
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

      const request = {
        id: 'goal_123',
        description: 'Comprar Carro Novo',
        targetValue: 60000,
        priority: 2,
      };

      const updatedGoal = new Goal({
        id: 'goal_123',
        userId: 'user_123',
        description: 'Comprar Carro Novo',
        type: 'compra',
        targetValue: new Money(60000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 2,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.save.mockResolvedValue(updatedGoal);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('goal_123');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Goal));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'GoalUpdated',
        expect.objectContaining({
          type: 'GoalUpdated',
          data: updatedGoal,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when goal update fails', async () => {
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

      const request = {
        id: 'goal_123',
        description: 'Comprar Carro Novo',
      };

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when goal is not found', async () => {
      // Arrange
      const request = {
        id: 'goal_999',
        description: 'Comprar Carro Novo',
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when validation fails', async () => {
      // Arrange
      const request = {
        id: 'goal_123',
        description: '', // Invalid description
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct updated goal data', async () => {
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

      const request = {
        id: 'goal_456',
        description: 'Viagem para Europa Premium',
        targetValue: 120000,
        importance: 'alta' as const,
        priority: 1,
      };

      const updatedGoal = new Goal({
        id: 'goal_456',
        userId: 'user_456',
        description: 'Viagem para Europa Premium',
        type: 'economia',
        targetValue: new Money(120000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-06-30'),
        monthlyIncome: new Money(12000, 'BRL'),
        fixedExpenses: new Money(4000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(2000, 'BRL'),
        numParcela: 18,
        status: 'active',
        createdAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingGoal);
      mockRepository.save.mockResolvedValue(updatedGoal);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('GoalUpdated');
      expect(publishedEvent.data).toBe(updatedGoal);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
});
