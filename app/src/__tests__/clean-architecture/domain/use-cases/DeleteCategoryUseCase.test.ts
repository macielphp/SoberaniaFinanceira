// Tests for DeleteCategoryUseCase
import { DeleteCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

// Mock repository for testing
class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];

  async save(category: Category): Promise<Category> {
    const index = this.categories.findIndex(cat => cat.id === category.id);
    if (index >= 0) {
      this.categories[index] = category;
    } else {
      this.categories.push(category);
    }
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find(cat => cat.id === id) || null;
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories];
  }

  async findByName(name: string): Promise<Category[]> {
    return this.categories.filter(cat => cat.name.toLowerCase().includes(name.toLowerCase()));
  }

  async findByType(type: string): Promise<Category[]> {
    return this.categories.filter(cat => cat.type === type);
  }

  async findDefault(): Promise<Category[]> {
    return this.categories.filter(cat => cat.isDefault);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index >= 0) {
      this.categories.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.categories.length;
  }

  async countByType(type: string): Promise<number> {
    return this.categories.filter(cat => cat.type === type).length;
  }
}

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockRepository: MockCategoryRepository;

  beforeEach(() => {
    mockRepository = new MockCategoryRepository();
    useCase = new DeleteCategoryUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete category successfully', async () => {
      // Create a category to delete
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(category);

      // Verify category exists before deletion
      const existingCategory = await mockRepository.findById('cat-1');
      expect(existingCategory).toBeDefined();

      const result = await useCase.execute('cat-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);

      // Verify category was deleted
      const deletedCategory = await mockRepository.findById('cat-1');
      expect(deletedCategory).toBeNull();
    });

    it('should return success false when category does not exist', async () => {
      const result = await useCase.execute('non-existent-id');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(false);
    });

    it('should not affect other categories when deleting one', async () => {
      // Create multiple categories
      const category1 = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      const category2 = new Category({
        id: 'cat-2',
        name: 'Transporte',
        type: 'expense',
        isDefault: false
      });
      const category3 = new Category({
        id: 'cat-3',
        name: 'Vendas',
        type: 'income',
        isDefault: true
      });

      await mockRepository.save(category1);
      await mockRepository.save(category2);
      await mockRepository.save(category3);

      // Verify all categories exist
      expect(await mockRepository.count()).toBe(3);

      // Delete one category
      const result = await useCase.execute('cat-2');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);

      // Verify only the specified category was deleted
      expect(await mockRepository.count()).toBe(2);
      expect(await mockRepository.findById('cat-1')).toBeDefined();
      expect(await mockRepository.findById('cat-2')).toBeNull();
      expect(await mockRepository.findById('cat-3')).toBeDefined();
    });

    it('should handle deletion of default categories', async () => {
      // Create a default category
      const defaultCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true
      });
      await mockRepository.save(defaultCategory);

      const result = await useCase.execute('cat-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);

      // Verify default category was deleted
      const deletedCategory = await mockRepository.findById('cat-1');
      expect(deletedCategory).toBeNull();
    });
  });

  describe('validation', () => {
    it('should fail when id is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category ID cannot be empty');
    });

    it('should fail when id is null', async () => {
      const result = await useCase.execute(null as any);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category ID cannot be empty');
    });

    it('should fail when id is undefined', async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category ID cannot be empty');
    });
  });

  describe('repository errors', () => {
    it('should handle repository findById errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: ICategoryRepository = {
        save: jest.fn(),
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new DeleteCategoryUseCase(errorRepository);

      const result = await useCaseWithError.execute('cat-1');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete category');
    });

    it('should handle repository delete errors', async () => {
      // Create initial category
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });

      // Create a mock repository that throws an error on delete
      const errorRepository: ICategoryRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(category),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn().mockRejectedValue(new Error('Database error')),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new DeleteCategoryUseCase(errorRepository);

      const result = await useCaseWithError.execute('cat-1');

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete category');
    });
  });

  describe('edge cases', () => {
    it('should handle deletion of last category', async () => {
      // Create only one category
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(category);

      expect(await mockRepository.count()).toBe(1);

      const result = await useCase.execute('cat-1');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);
      expect(await mockRepository.count()).toBe(0);
    });

    it('should handle deletion of category with special characters in id', async () => {
      // Create a category with special characters in id
      const category = new Category({
        id: 'cat-special-123!@#',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(category);

      const result = await useCase.execute('cat-special-123!@#');

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().success).toBe(true);

      // Verify category was deleted
      const deletedCategory = await mockRepository.findById('cat-special-123!@#');
      expect(deletedCategory).toBeNull();
    });

    it('should handle multiple deletion attempts on same category', async () => {
      // Create a category
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(category);

      // First deletion should succeed
      const result1 = await useCase.execute('cat-1');
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().success).toBe(true);

      // Second deletion should return success false (category doesn't exist)
      const result2 = await useCase.execute('cat-1');
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().success).toBe(false);
    });
  });
}); 