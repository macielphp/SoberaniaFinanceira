import { CreateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/CreateCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

describe('CreateCategoryUseCase with Events', () => {
  let useCase: CreateCategoryUseCase;
  let mockRepository: jest.Mocked<ICategoryRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
      findByType: jest.fn(),
      findDefault: jest.fn(),
      count: jest.fn(),
      countByType: jest.fn(),
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

    useCase = new CreateCategoryUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish CategoryCreated event when category is created successfully', async () => {
      // Arrange
      const request = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      const savedCategory = new Category({
        id: 'cat_123',
        name: 'Alimentação',
        type: 'expense',
      });

      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(savedCategory);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Category));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'CategoryCreated',
        expect.objectContaining({
          type: 'CategoryCreated',
          data: savedCategory,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when category creation fails', async () => {
      // Arrange
      const request = {
        name: 'Alimentação',
        type: 'expense' as const,
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
        type: 'expense' as const,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct category data', async () => {
      // Arrange
      const request = {
        name: 'Transporte',
        type: 'expense' as const,
      };

      const savedCategory = new Category({
        id: 'cat_456',
        name: 'Transporte',
        type: 'expense',
      });

      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(savedCategory);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('CategoryCreated');
      expect(publishedEvent.data).toBe(savedCategory);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
}); 