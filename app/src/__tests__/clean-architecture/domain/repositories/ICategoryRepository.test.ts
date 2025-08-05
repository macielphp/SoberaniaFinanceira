// Tests for ICategoryRepository Interface
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

// Mock implementation for testing
class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];

  async save(category: Category): Promise<Category> {
    const existingIndex = this.categories.findIndex(cat => cat.id === category.id);
    if (existingIndex >= 0) {
      this.categories[existingIndex] = category;
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

  async findByType(type: string): Promise<Category[]> {
    return this.categories.filter(cat => cat.type === type);
  }

  async findByName(name: string): Promise<Category[]> {
    return this.categories.filter(cat => 
      cat.name.toLowerCase().includes(name.toLowerCase())
    );
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

describe('ICategoryRepository', () => {
  let repository: ICategoryRepository;

  beforeEach(() => {
    repository = new MockCategoryRepository();
  });

  describe('save', () => {
    it('should save a new category', async () => {
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true
      });

      const savedCategory = await repository.save(category);
      expect(savedCategory).toEqual(category);
      
      const found = await repository.findById('cat-1');
      expect(found).toEqual(category);
    });

    it('should update an existing category', async () => {
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: false
      });

      await repository.save(category);

      const updatedCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação Atualizada',
        type: 'expense',
        isDefault: true
      });

      const saved = await repository.save(updatedCategory);
      expect(saved.name).toBe('Alimentação Atualizada');
      expect(saved.isDefault).toBe(true);
      
      const found = await repository.findById('cat-1');
      expect(found?.name).toBe('Alimentação Atualizada');
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      await repository.save(category);
      const found = await repository.findById('cat-1');
      expect(found).toEqual(category);
    });

    it('should return null when category not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const category1 = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      const category2 = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income'
      });

      await repository.save(category1);
      await repository.save(category2);

      const allCategories = await repository.findAll();
      expect(allCategories).toHaveLength(2);
      expect(allCategories).toContainEqual(category1);
      expect(allCategories).toContainEqual(category2);
    });

    it('should return empty array when no categories exist', async () => {
      const allCategories = await repository.findAll();
      expect(allCategories).toEqual([]);
    });
  });

  describe('findByType', () => {
    it('should return categories of specific type', async () => {
      const expenseCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      const incomeCategory = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income'
      });

      const expenseCategory2 = new Category({
        id: 'cat-3',
        name: 'Transporte',
        type: 'expense'
      });

      await repository.save(expenseCategory);
      await repository.save(incomeCategory);
      await repository.save(expenseCategory2);

      const expenseCategories = await repository.findByType('expense');
      expect(expenseCategories).toHaveLength(2);
      expect(expenseCategories).toContainEqual(expenseCategory);
      expect(expenseCategories).toContainEqual(expenseCategory2);

      const incomeCategories = await repository.findByType('income');
      expect(incomeCategories).toHaveLength(1);
      expect(incomeCategories).toContainEqual(incomeCategory);
    });
  });

  describe('findByName', () => {
    it('should return categories matching name pattern', async () => {
      const alimentacaoCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      const alimentacaoRapidaCategory = new Category({
        id: 'cat-2',
        name: 'Alimentação Rápida',
        type: 'expense'
      });

      const vendasCategory = new Category({
        id: 'cat-3',
        name: 'Vendas',
        type: 'income'
      });

      await repository.save(alimentacaoCategory);
      await repository.save(alimentacaoRapidaCategory);
      await repository.save(vendasCategory);

      const alimentacaoCategories = await repository.findByName('Alimentação');
      expect(alimentacaoCategories).toHaveLength(2);
      expect(alimentacaoCategories).toContainEqual(alimentacaoCategory);
      expect(alimentacaoCategories).toContainEqual(alimentacaoRapidaCategory);

      const vendasCategories = await repository.findByName('Vendas');
      expect(vendasCategories).toHaveLength(1);
      expect(vendasCategories).toContainEqual(vendasCategory);
    });
  });

  describe('findDefault', () => {
    it('should return only default categories', async () => {
      const defaultCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true
      });

      const customCategory = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income',
        isDefault: false
      });

      const defaultCategory2 = new Category({
        id: 'cat-3',
        name: 'Transporte',
        type: 'expense',
        isDefault: true
      });

      await repository.save(defaultCategory);
      await repository.save(customCategory);
      await repository.save(defaultCategory2);

      const defaultCategories = await repository.findDefault();
      expect(defaultCategories).toHaveLength(2);
      expect(defaultCategories).toContainEqual(defaultCategory);
      expect(defaultCategories).toContainEqual(defaultCategory2);
      expect(defaultCategories).not.toContainEqual(customCategory);
    });
  });

  describe('delete', () => {
    it('should delete category and return true', async () => {
      const category = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      await repository.save(category);
      const deleted = await repository.delete('cat-1');
      expect(deleted).toBe(true);

      const found = await repository.findById('cat-1');
      expect(found).toBeNull();
    });

    it('should return false when category does not exist', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of categories', async () => {
      expect(await repository.count()).toBe(0);

      const category1 = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      await repository.save(category1);
      expect(await repository.count()).toBe(1);

      const category2 = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income'
      });

      await repository.save(category2);
      expect(await repository.count()).toBe(2);
    });
  });

  describe('countByType', () => {
    it('should return correct count of categories by type', async () => {
      expect(await repository.countByType('expense')).toBe(0);
      expect(await repository.countByType('income')).toBe(0);

      const expenseCategory = new Category({
        id: 'cat-1',
        name: 'Alimentação',
        type: 'expense'
      });

      await repository.save(expenseCategory);
      expect(await repository.countByType('expense')).toBe(1);
      expect(await repository.countByType('income')).toBe(0);

      const incomeCategory = new Category({
        id: 'cat-2',
        name: 'Vendas',
        type: 'income'
      });

      await repository.save(incomeCategory);
      expect(await repository.countByType('expense')).toBe(1);
      expect(await repository.countByType('income')).toBe(1);

      const expenseCategory2 = new Category({
        id: 'cat-3',
        name: 'Transporte',
        type: 'expense'
      });

      await repository.save(expenseCategory2);
      expect(await repository.countByType('expense')).toBe(2);
      expect(await repository.countByType('income')).toBe(1);
    });
  });
}); 