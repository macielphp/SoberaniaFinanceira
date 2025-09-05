// Test: CategoriesSubScreen
// Responsável por testar a lógica de apresentação para gerenciamento de categorias
// Integra com CategoryViewModel

import { CategoriesSubScreen } from '../../../../clean-architecture/presentation/screens/CategoriesSubScreen';
import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

// Mock CategoryViewModel
const mockCategoryViewModel = {
  loading: false,
  error: null,
  categories: [] as Category[],
  isLoading: false,
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  loadCategories: jest.fn(),
  getCategoryById: jest.fn(),
  validateForm: jest.fn(),
  setError: jest.fn(),
  setCategory: jest.fn(),
  setLoading: jest.fn(),
};

// Mock Category entity
const mockCategory = new Category({
  id: 'cat-1',
  name: 'Alimentação',
  type: 'expense',
  isDefault: false,
  createdAt: new Date('2024-01-01'),
});

const mockCategories = [
  mockCategory,
  new Category({
    id: 'cat-2',
    name: 'Salário',
    type: 'income',
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  }),
  new Category({
    id: 'cat-3',
    name: 'Transporte',
    type: 'expense',
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  }),
];

describe('CategoriesSubScreen', () => {
  let categoriesSubScreen: CategoriesSubScreen;

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesSubScreen = new CategoriesSubScreen(mockCategoryViewModel as any);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      (mockCategoryViewModel as any).categories = [];
      
      expect(categoriesSubScreen.getCategories()).toEqual([]);
      expect(categoriesSubScreen.getLoading()).toBe(false);
      expect(categoriesSubScreen.getError()).toBeNull();
      expect(categoriesSubScreen.getShowForm()).toBe(false);
      expect(categoriesSubScreen.getEditingCategory()).toBeNull();
    });

    it('should load initial data on mount', async () => {
      mockCategoryViewModel.loadCategories.mockResolvedValue(mockCategories);
      (mockCategoryViewModel as any).categories = mockCategories;

      await categoriesSubScreen.onMount();

      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(categoriesSubScreen.getCategories()).toEqual(mockCategories);
    });
  });

  describe('category management', () => {
    it('should get all categories', () => {
      (mockCategoryViewModel as any).categories = mockCategories;

      const categories = categoriesSubScreen.getCategories();

      expect(categories).toEqual(mockCategories);
    });

    it('should create new category', async () => {
      const categoryData = {
        name: 'Nova Categoria',
        type: 'expense' as const,
      };

      const newCategory = new Category({
        id: 'cat-new',
        ...categoryData,
        isDefault: false,
        createdAt: new Date(),
      });

      mockCategoryViewModel.createCategory.mockResolvedValue(newCategory);
      (mockCategoryViewModel as any).categories = [...mockCategories, newCategory];

      const result = await categoriesSubScreen.createCategory(categoryData);

      expect(result).toEqual(newCategory);
      expect(mockCategoryViewModel.createCategory).toHaveBeenCalledWith(categoryData);
      expect(categoriesSubScreen.getShowForm()).toBe(false);
    });

    it('should handle category creation error', async () => {
      const categoryData = {
        name: 'Categoria Inválida',
        type: 'expense' as const,
      };

      const error = new Error('Erro ao criar categoria');
      mockCategoryViewModel.createCategory.mockRejectedValue(error);

      await expect(categoriesSubScreen.createCategory(categoryData))
        .rejects.toThrow('Erro ao criar categoria');

      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Erro ao criar categoria');
    });

    it('should update existing category', async () => {
      const categoryId = 'cat-1';
      const updateData = {
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      const updatedCategory = new Category({
        id: categoryId,
        ...updateData,
        isDefault: false,
        createdAt: mockCategory.createdAt,
      });

      mockCategoryViewModel.updateCategory.mockResolvedValue(updatedCategory);
      mockCategoryViewModel.categories = [updatedCategory, ...mockCategories.slice(1)];

      const result = await categoriesSubScreen.updateCategory(categoryId, updateData);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryViewModel.updateCategory).toHaveBeenCalledWith(updateData);
      expect(categoriesSubScreen.getShowForm()).toBe(false);
      expect(categoriesSubScreen.getEditingCategory()).toBeNull();
    });

    it('should handle category update error', async () => {
      const categoryId = 'cat-1';
      const updateData = {
        name: 'Categoria Atualizada',
        type: 'expense' as const,
      };

      const error = new Error('Erro ao atualizar categoria');
      mockCategoryViewModel.updateCategory.mockRejectedValue(error);

      await expect(categoriesSubScreen.updateCategory(categoryId, updateData))
        .rejects.toThrow('Erro ao atualizar categoria');

      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Erro ao atualizar categoria');
    });

    it('should delete category', async () => {
      const categoryId = 'cat-1';
      mockCategoryViewModel.deleteCategory.mockResolvedValue(true);
      mockCategoryViewModel.categories = mockCategories.filter(cat => cat.id !== categoryId);

      const result = await categoriesSubScreen.deleteCategory(categoryId);

      expect(result).toBe(true);
      expect(mockCategoryViewModel.deleteCategory).toHaveBeenCalledWith(categoryId);
    });

    it('should handle category deletion error', async () => {
      const categoryId = 'cat-1';
      const error = new Error('Erro ao deletar categoria');
      mockCategoryViewModel.deleteCategory.mockRejectedValue(error);

      await expect(categoriesSubScreen.deleteCategory(categoryId))
        .rejects.toThrow('Erro ao deletar categoria');

      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Erro ao deletar categoria');
    });
  });

  describe('form management', () => {
    it('should show form for new category', () => {
      categoriesSubScreen.showForm();

      expect(categoriesSubScreen.getShowForm()).toBe(true);
      expect(categoriesSubScreen.getEditingCategory()).toBeNull();
    });

    it('should show form for editing category', () => {
      categoriesSubScreen.editCategory(mockCategory);

      expect(categoriesSubScreen.getShowForm()).toBe(true);
      expect(categoriesSubScreen.getEditingCategory()).toEqual(mockCategory);
    });

    it('should hide form', () => {
      categoriesSubScreen.hideForm();

      expect(categoriesSubScreen.getShowForm()).toBe(false);
      expect(categoriesSubScreen.getEditingCategory()).toBeNull();
    });

    it('should cancel form editing', () => {
      categoriesSubScreen.editCategory(mockCategory);
      categoriesSubScreen.cancelEdit();

      expect(categoriesSubScreen.getShowForm()).toBe(false);
      expect(categoriesSubScreen.getEditingCategory()).toBeNull();
    });
  });

  describe('filtering and search', () => {
    beforeEach(() => {
      mockCategoryViewModel.categories = mockCategories;
    });

    it('should filter categories by type', () => {
      const filteredCategories = categoriesSubScreen.filterCategoriesByType('expense');

      expect(filteredCategories).toHaveLength(2);
      expect(filteredCategories.every((cat: Category) => cat.type === 'expense')).toBe(true);
    });

    it('should filter categories by type - receita', () => {
      const filteredCategories = categoriesSubScreen.filterCategoriesByType('income');

      expect(filteredCategories).toHaveLength(1);
      expect(filteredCategories[0].type).toBe('income');
    });

    it('should search categories by name', () => {
      const searchResults = categoriesSubScreen.searchCategories('alimentação');

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name.toLowerCase()).toContain('alimentação');
    });

    it('should return empty array for no search results', () => {
      const searchResults = categoriesSubScreen.searchCategories('inexistente');

      expect(searchResults).toHaveLength(0);
    });

    it('should get categories by type with counts', () => {
      const categoriesByType = categoriesSubScreen.getCategoriesByType();

      expect(categoriesByType).toEqual({
        income: 1,
        expense: 2,
      });
    });
  });

  describe('validation', () => {
    it('should validate category data', () => {
      const categoryData = {
        name: 'Nova Categoria',
        type: 'expense' as const,
      };

      const validationResult = {
        isValid: true,
        errors: {},
      };

      mockCategoryViewModel.validateForm.mockReturnValue(validationResult);

      const result = categoriesSubScreen.validateCategoryData(categoryData);

      expect(result).toEqual(validationResult);
      expect(mockCategoryViewModel.validateForm).toHaveBeenCalledWith(categoryData);
    });

    it('should return validation errors for invalid data', () => {
      const categoryData = {
        name: '',
        type: 'expense' as const,
      };

      const validationResult = {
        isValid: false,
        errors: {
          name: 'Nome é obrigatório',
        },
      };

      mockCategoryViewModel.validateForm.mockReturnValue(validationResult);

      const result = categoriesSubScreen.validateCategoryData(categoryData);

      expect(result).toEqual(validationResult);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      categoriesSubScreen.clearErrors();

      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith(null);
    });

    it('should get loading state', () => {
      mockCategoryViewModel.isLoading = true;

      const loading = categoriesSubScreen.getLoading();

      expect(loading).toBe(true);
    });

    it('should get error state', () => {
      (mockCategoryViewModel as any).error = 'Erro de teste';

      const error = categoriesSubScreen.getError();

      expect(error).toBe('Erro de teste');
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      mockCategoryViewModel.categories = mockCategories;
    });

    it('should get total categories count', () => {
      const totalCount = categoriesSubScreen.getTotalCategoriesCount();

      expect(totalCount).toBe(3);
    });

    it('should get active categories count', () => {
      const activeCount = categoriesSubScreen.getActiveCategoriesCount();

      expect(activeCount).toBe(3); // All categories are active in mock data
    });

    it('should get categories statistics', () => {
      const stats = categoriesSubScreen.getCategoriesStatistics();

      expect(stats).toEqual({
        total: 3,
        active: 3,
        inactive: 0,
        byType: {
          income: 1,
          expense: 2,
        },
      });
    });
  });
});
