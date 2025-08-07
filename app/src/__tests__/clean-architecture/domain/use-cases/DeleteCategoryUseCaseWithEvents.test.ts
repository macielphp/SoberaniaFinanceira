import { DeleteCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';
import { DomainEventFactory } from '../../../../clean-architecture/domain/events/DomainEvents';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

describe('DeleteCategoryUseCase with Events', () => {
  let useCase: DeleteCategoryUseCase;
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

    useCase = new DeleteCategoryUseCase(mockRepository, mockEventBus);
  });

  describe('execute with events', () => {
    it('should publish CategoryDeleted event when category is deleted successfully', async () => {
      // Arrange
      const categoryId = 'cat_123';
      const existingCategory = new Category({
        id: categoryId,
        name: 'Alimentação',
        type: 'expense',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).toHaveBeenCalledWith(categoryId);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'CategoryDeleted',
        expect.objectContaining({
          type: 'CategoryDeleted',
          data: { categoryId },
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not publish event when category deletion fails', async () => {
      // Arrange
      const categoryId = 'cat_123';

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match(
        (response) => response.success,
        () => false
      )).toBe(false);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish event when category is not found', async () => {
      // Arrange
      const categoryId = 'cat_123';

      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match(
        (response) => response.success,
        () => false
      )).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should publish event with correct category ID', async () => {
      // Arrange
      const categoryId = 'cat_456';
      const existingCategory = new Category({
        id: categoryId,
        name: 'Transporte',
        type: 'expense',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      
      const publishedEvent = mockEventBus.publish.mock.calls[0][1] as any;
      expect(publishedEvent.type).toBe('CategoryDeleted');
      expect(publishedEvent.data.categoryId).toBe(categoryId);
      expect(publishedEvent.timestamp).toBeInstanceOf(Date);
    });

    it('should not publish event when delete operation returns false', async () => {
      // Arrange
      const categoryId = 'cat_123';
      const existingCategory = new Category({
        id: categoryId,
        name: 'Alimentação',
        type: 'expense',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.delete.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.match(
        (response) => response.success,
        () => false
      )).toBe(false);
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });
});
