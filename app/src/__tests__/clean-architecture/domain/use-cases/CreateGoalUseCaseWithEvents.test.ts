import { CreateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/CreateGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('CreateGoalUseCase with Events', () => {
  let useCase: CreateGoalUseCase;
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

    useCase = new CreateGoalUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish GoalCreated event when goal is created successfully', async () => {
      // Arrange
      const request = {
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: 50000,
        userId: 'user_123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 8000,
        fixedExpenses: 3000,
        availablePerMonth: 2000,
        importance: 'alta' as const,
        priority: 1,
        monthlyContribution: 1500,
        numParcela: 12,
      };

      const savedGoal = new Goal({
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

      mockRepository.save.mockResolvedValue(savedGoal);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Goal));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'GoalCreated',
        expect.objectContaining({
          type: 'GoalCreated',
          data: savedGoal,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when goal creation fails', async () => {
      // Arrange
      const request = {
        description: 'Comprar Carro',
        type: 'compra' as const,
        targetValue: 50000,
        userId: 'user_123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 8000,
        fixedExpenses: 3000,
        availablePerMonth: 2000,
        importance: 'alta' as const,
        priority: 1,
        monthlyContribution: 1500,
        numParcela: 12,
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
        description: '', // Invalid description
        type: 'compra' as const,
        targetValue: 50000,
        userId: 'user_123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: 8000,
        fixedExpenses: 3000,
        availablePerMonth: 2000,
        importance: 'alta' as const,
        priority: 1,
        monthlyContribution: 1500,
        numParcela: 12,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct goal data', async () => {
      // Arrange
      const request = {
        description: 'Viagem para Europa',
        type: 'economia' as const,
        targetValue: 100000,
        userId: 'user_456',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-06-30'),
        monthlyIncome: 12000,
        fixedExpenses: 4000,
        availablePerMonth: 3000,
        importance: 'média' as const,
        priority: 2,
        monthlyContribution: 2000,
        numParcela: 18,
      };

      const savedGoal = new Goal({
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

      mockRepository.save.mockResolvedValue(savedGoal);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('GoalCreated');
      expect(publishedEvent.data).toBe(savedGoal);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
});
