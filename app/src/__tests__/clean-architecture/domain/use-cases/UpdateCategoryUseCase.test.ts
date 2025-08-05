// Tests for UpdateCategoryUseCase
import { UpdateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateCategoryUseCase';
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

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let mockRepository: MockCategoryRepository;

  beforeEach(() => {
    mockRepository = new MockCategoryRepository();
    useCase = new UpdateCategoryUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update category name successfully', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        name: 'Alimentação e Bebidas'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.name).toBe('Alimentação e Bebidas');
      expect(updatedCategory.type).toBe('expense'); // Should remain unchanged
      expect(updatedCategory.isDefault).toBe(false); // Should remain unchanged
      expect(updatedCategory.id).toBe('cat-1');
      expect(updatedCategory.createdAt).toEqual(originalCategory.createdAt);
    });

    it('should update category type successfully', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        type: 'income' as const
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.type).toBe('income');
      expect(updatedCategory.name).toBe('Alimentação'); // Should remain unchanged
      expect(updatedCategory.isDefault).toBe(false); // Should remain unchanged
    });

    it('should update category isDefault flag successfully', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        isDefault: true
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.isDefault).toBe(true);
      expect(updatedCategory.name).toBe('Alimentação'); // Should remain unchanged
      expect(updatedCategory.type).toBe('expense'); // Should remain unchanged
    });

    it('should update multiple fields at once', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        name: 'Alimentação e Bebidas',
        type: 'income' as const,
        isDefault: true
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.name).toBe('Alimentação e Bebidas');
      expect(updatedCategory.type).toBe('income');
      expect(updatedCategory.isDefault).toBe(true);
    });

    it('should save updated category to repository', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        name: 'Alimentação e Bebidas'
      };

      const result = await useCase.execute(updateData);
      const updatedCategory = result.getOrThrow().category;

      // Verify category was saved to repository
      const savedCategory = await mockRepository.findById(updatedCategory.id);
      expect(savedCategory).toEqual(updatedCategory);
    });
  });

  describe('validation', () => {
    it('should fail when id is empty', async () => {
      const updateData = {
        id: '',
        name: 'New Name'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category ID cannot be empty');
    });

    it('should fail when name is empty', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        name: ''
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category name cannot be empty');
    });

    it('should fail when type is invalid', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(originalCategory);

      const updateData = {
        id: 'cat-1',
        type: 'invalid' as any
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid category type');
    });
  });

  describe('business rules', () => {
    it('should fail when category does not exist', async () => {
      const updateData = {
        id: 'non-existent-id',
        name: 'New Name'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category not found');
    });

    it('should fail when name already exists for same type', async () => {
      // Create two categories
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
      await mockRepository.save(category1);
      await mockRepository.save(category2);

      // Try to update category2 with the same name as category1
      const updateData = {
        id: 'cat-2',
        name: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category with this name already exists');
    });

    it('should allow same name for different types', async () => {
      // Create two categories with different types
      const category1 = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      const category2 = new Category({
        id: 'cat-2',
        name: 'Transporte',
        type: 'income',
        isDefault: false
      });
      await mockRepository.save(category1);
      await mockRepository.save(category2);

      // Try to update category2 with the same name as category1
      const updateData = {
        id: 'cat-2',
        name: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.name).toBe('Alimentação');
      expect(updatedCategory.type).toBe('income');
    });

    it('should allow updating to same name if it is the same category', async () => {
      // Create category
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });
      await mockRepository.save(category);

      // Try to update with the same name
      const updateData = {
        id: 'cat-1',
        name: 'Alimentação'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedCategory = result.getOrThrow().category;
      expect(updatedCategory.name).toBe('Alimentação');
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

      const useCaseWithError = new UpdateCategoryUseCase(errorRepository);

      const updateData = {
        id: 'cat-1',
        name: 'New Name'
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update category');
    });

    it('should handle repository save errors', async () => {
      // Create initial category
      const originalCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });

      // Create a mock repository that throws an error on save
      const errorRepository: ICategoryRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn().mockResolvedValue(originalCategory),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new UpdateCategoryUseCase(errorRepository);

      const updateData = {
        id: 'cat-1',
        name: 'New Name'
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update category');
    });
  });
}); 