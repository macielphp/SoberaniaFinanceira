// Tests for GetCategoriesUseCase
import { GetCategoriesUseCase } from '../../../../clean-architecture/domain/use-cases/GetCategoriesUseCase';
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

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
  let mockRepository: MockCategoryRepository;

  beforeEach(() => {
    mockRepository = new MockCategoryRepository();
    useCase = new GetCategoriesUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return empty list when no categories exist', async () => {
      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.categories).toEqual([]);
      expect(response.total).toBe(0);
    });

    it('should return all categories when they exist', async () => {
      // Create test categories
      const category1 = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });

      const category2 = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income',
        isDefault: true
      });

      await mockRepository.save(category1);
      await mockRepository.save(category2);

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.categories).toHaveLength(2);
      expect(response.total).toBe(2);
      
      expect(response.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'cat-1',
            name: 'Alimentação',
            type: 'expense'
          }),
          expect.objectContaining({
            id: 'cat-2',
            name: 'Vendas',
            type: 'income'
          })
        ])
      );
    });

    it('should return correct total count', async () => {
      // Create multiple categories
      const categories = [
        new Category({ id: 'cat-1', name: 'Alimentação', type: 'expense' }),
        new Category({ id: 'cat-2', name: 'Vendas', type: 'income' }),
        new Category({ id: 'cat-3', name: 'Transporte', type: 'expense' })
      ];

      for (const category of categories) {
        await mockRepository.save(category);
      }

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.categories).toHaveLength(3);
      expect(response.total).toBe(3);
    });

    it('should return categories in the order they were saved', async () => {
      const category1 = new Category({
        id: 'cat-1',
        name: 'First Category',
        type: 'expense'
      });

      const category2 = new Category({
        id: 'cat-2',
        name: 'Second Category',
        type: 'income'
      });

      await mockRepository.save(category1);
      await mockRepository.save(category2);

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      const response = result.getOrThrow();
      expect(response.categories[0].id).toBe('cat-1');
      expect(response.categories[1].id).toBe('cat-2');
    });
  });

  describe('repository errors', () => {
    it('should handle repository findAll errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: ICategoryRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countByType: jest.fn()
      };

      const useCaseWithError = new GetCategoriesUseCase(errorRepository);

      const result = await useCaseWithError.execute();

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get categories');
    });

    it('should handle repository count errors', async () => {
      // Create a mock repository that throws an error on count
      const errorRepository: ICategoryRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockResolvedValue([]),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findDefault: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockRejectedValue(new Error('Database error')),
        countByType: jest.fn()
      };

      const useCaseWithError = new GetCategoriesUseCase(errorRepository);

      const result = await useCaseWithError.execute();

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get categories');
    });
  });
}); 