import { UpdateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

describe('UpdateCategoryUseCase with Events', () => {
  let useCase: UpdateCategoryUseCase;
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

    useCase = new UpdateCategoryUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish CategoryUpdated event when category is updated successfully', async () => {
      // Arrange
      const existingCategory = new Category({
        id: 'cat_123',
        name: 'Alimentação',
        type: 'expense',
      });

      const request = {
        id: 'cat_123',
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      const updatedCategory = new Category({
        id: 'cat_123',
        name: 'Alimentação Atualizada',
        type: 'expense',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(updatedCategory);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('cat_123');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Category));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'CategoryUpdated',
        expect.objectContaining({
          type: 'CategoryUpdated',
          data: updatedCategory,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when category update fails', async () => {
      // Arrange
      const request = {
        id: 'cat_123',
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
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
      const existingCategory = new Category({
        id: 'cat_123',
        name: 'Alimentação',
        type: 'expense',
      });

      const request = {
        id: 'cat_123',
        name: '', // Invalid name
        type: 'expense' as const,
      };

      mockRepository.findById.mockResolvedValue(existingCategory);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct updated category data', async () => {
      // Arrange
      const existingCategory = new Category({
        id: 'cat_456',
        name: 'Transporte',
        type: 'expense',
      });

      const request = {
        id: 'cat_456',
        name: 'Transporte Atualizado',
        type: 'expense' as const,
      };

      const updatedCategory = new Category({
        id: 'cat_456',
        name: 'Transporte Atualizado',
        type: 'expense',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.findByName.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(updatedCategory);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('CategoryUpdated');
      expect(publishedEvent.data).toBe(updatedCategory);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });
  });
});
