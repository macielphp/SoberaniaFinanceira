// Tests for CreateCategoryUseCase
import { CreateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/CreateCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

// Mock repository for testing
class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];

  async save(category: Category): Promise<Category> {
    this.categories.push(category);
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

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let mockRepository: MockCategoryRepository;

  beforeEach(() => {
    mockRepository = new MockCategoryRepository();
    useCase = new CreateCategoryUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a new category successfully', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const,
        isDefault: false
      };

      const result = await useCase.execute(categoryData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().category).toBeInstanceOf(Category);
      
      const category = result.getOrThrow().category;
      expect(category.name).toBe('Alimentação');
      expect(category.type).toBe('expense');
      expect(category.isDefault).toBe(false);
      expect(category.id).toBeDefined();
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should create category with minimal required data', async () => {
      const categoryData = {
        name: 'Vendas',
        type: 'income' as const
      };

      const result = await useCase.execute(categoryData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().category).toBeInstanceOf(Category);
      
      const category = result.getOrThrow().category;
      expect(category.name).toBe('Vendas');
      expect(category.type).toBe('income');
      expect(category.isDefault).toBe(false); // Default value
    });

    it('should create default category', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const,
        isDefault: true
      };

      const result = await useCase.execute(categoryData);

      expect(result.isSuccess()).toBe(true);
      const category = result.getOrThrow().category;
      expect(category.isDefault).toBe(true);
    });

    it('should save category to repository', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      const result = await useCase.execute(categoryData);
      const category = result.getOrThrow().category;

      // Verify category was saved to repository
      const savedCategory = await mockRepository.findById(category.id);
      expect(savedCategory).toEqual(category);
    });

    it('should generate unique ID for each category', async () => {
      const categoryData1 = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      const categoryData2 = {
        name: 'Vendas',
        type: 'income' as const
      };

      const result1 = await useCase.execute(categoryData1);
      const result2 = await useCase.execute(categoryData2);

      const category1 = result1.getOrThrow().category;
      const category2 = result2.getOrThrow().category;

      expect(category1.id).not.toBe(category2.id);
    });
  });

  describe('validation', () => {
    it('should fail when name is empty', async () => {
      const categoryData = {
        name: '',
        type: 'expense' as const
      };

      const result = await useCase.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category name cannot be empty');
    });

    it('should fail when type is empty', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: '' as any
      };

      const result = await useCase.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category type cannot be empty');
    });

    it('should fail when type is invalid', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'invalid' as any
      };

      const result = await useCase.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid category type');
    });

    it('should fail when category name already exists', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      // Create first category
      await useCase.execute(categoryData);

      // Try to create second category with same name
      const result = await useCase.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Category with this name already exists');
    });

    it('should allow same name for different types', async () => {
      const categoryData1 = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      const categoryData2 = {
        name: 'Alimentação',
        type: 'income' as const
      };

      // Create first category
      const result1 = await useCase.execute(categoryData1);
      expect(result1.isSuccess()).toBe(true);

      // Create second category with same name but different type
      const result2 = await useCase.execute(categoryData2);
      expect(result2.isSuccess()).toBe(true);

      const category1 = result1.getOrThrow().category;
      const category2 = result2.getOrThrow().category;

      expect(category1.name).toBe(category2.name);
      expect(category1.type).not.toBe(category2.type);
    });
  });

  describe('repository errors', () => {
    it('should handle repository save errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: ICategoryRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new CreateCategoryUseCase(errorRepository);

      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      const result = await useCaseWithError.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create category');
    });

    it('should handle repository findByName errors', async () => {
      // Create a mock repository that throws an error on findByName
      const errorRepository: ICategoryRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn().mockRejectedValue(new Error('Database error')),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new CreateCategoryUseCase(errorRepository);

      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const
      };

      const result = await useCaseWithError.execute(categoryData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create category');
    });
  });
}); 