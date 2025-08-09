import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

// Mock dos Use Cases
const mockCreateCategoryUseCase = {
  execute: jest.fn(),
};

const mockUpdateCategoryUseCase = {
  execute: jest.fn(),
};

const mockGetCategoryByIdUseCase = {
  execute: jest.fn(),
};

const mockGetCategoriesUseCase = {
  execute: jest.fn(),
};

const mockDeleteCategoryUseCase = {
  execute: jest.fn(),
};

describe('CategoryViewModel', () => {
  let categoryViewModel: CategoryViewModel;
  let mockCategory: Category;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock data
    mockCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
    });

    categoryViewModel = new CategoryViewModel(
      mockCreateCategoryUseCase,
      mockUpdateCategoryUseCase,
      mockGetCategoryByIdUseCase,
      mockGetCategoriesUseCase,
      mockDeleteCategoryUseCase
    );
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(categoryViewModel.category).toBeNull();
      expect(categoryViewModel.categories).toEqual([]);
      expect(categoryViewModel.isLoading).toBe(false);
      expect(categoryViewModel.error).toBeNull();
      expect(categoryViewModel.isEditing).toBe(false);
    });
  });

  describe('setCategory', () => {
    it('should set category and update editing state', () => {
      categoryViewModel.setCategory(mockCategory);

      expect(categoryViewModel.category).toEqual(mockCategory);
      expect(categoryViewModel.isEditing).toBe(true);
    });

    it('should set category to null and reset editing state', () => {
      categoryViewModel.setCategory(null);

      expect(categoryViewModel.category).toBeNull();
      expect(categoryViewModel.isEditing).toBe(false);
    });
  });

  describe('setCategories', () => {
    it('should set categories list', () => {
      const categories = [mockCategory];
      categoryViewModel.setCategories(categories);

      expect(categoryViewModel.categories).toEqual(categories);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      categoryViewModel.setLoading(true);
      expect(categoryViewModel.isLoading).toBe(true);

      categoryViewModel.setLoading(false);
      expect(categoryViewModel.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Erro ao salvar categoria';
      categoryViewModel.setError(errorMessage);
      expect(categoryViewModel.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      categoryViewModel.setError('Erro anterior');
      categoryViewModel.setError(null);
      expect(categoryViewModel.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Setup some state
      categoryViewModel.setCategory(mockCategory);
      categoryViewModel.setCategories([mockCategory]);
      categoryViewModel.setLoading(true);
      categoryViewModel.setError('Erro');

      categoryViewModel.reset();

      expect(categoryViewModel.category).toBeNull();
      expect(categoryViewModel.categories).toEqual([]);
      expect(categoryViewModel.isLoading).toBe(false);
      expect(categoryViewModel.error).toBeNull();
      expect(categoryViewModel.isEditing).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('should return true for valid category data', () => {
      const validData = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      const result = categoryViewModel.validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return false for invalid name', () => {
      const invalidData = {
        name: '',
        type: 'expense' as const,
      };

      const result = categoryViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome é obrigatório');
    });

    it('should return false for invalid type', () => {
      const invalidData = {
        name: 'Alimentação',
        type: '' as any,
      };

      const result = categoryViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBe('Tipo é obrigatório');
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      mockCreateCategoryUseCase.execute.mockResolvedValue(mockCategory);

      const result = await categoryViewModel.createCategory(categoryData);

      expect(mockCreateCategoryUseCase.execute).toHaveBeenCalledWith(categoryData);
      expect(result).toEqual(mockCategory);
      expect(categoryViewModel.category).toEqual(mockCategory);
      expect(categoryViewModel.isEditing).toBe(true);
    });

    it('should handle creation error', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      const error = new Error('Erro ao criar categoria');
      mockCreateCategoryUseCase.execute.mockRejectedValue(error);

      await expect(categoryViewModel.createCategory(categoryData)).rejects.toThrow('Erro ao criar categoria');
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      categoryViewModel.setCategory(mockCategory);

      const updatedData = {
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      const updatedCategory = new Category({
        id: mockCategory.id,
        ...updatedData,
      });

      mockUpdateCategoryUseCase.execute.mockResolvedValue(updatedCategory);

      const result = await categoryViewModel.updateCategory(updatedData);

      expect(mockUpdateCategoryUseCase.execute).toHaveBeenCalledWith(mockCategory.id, updatedData);
      expect(result).toEqual(updatedCategory);
      expect(categoryViewModel.category).toEqual(updatedCategory);
    });

    it('should handle update error', async () => {
      categoryViewModel.setCategory(mockCategory);

      const updatedData = {
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      const error = new Error('Erro ao atualizar categoria');
      mockUpdateCategoryUseCase.execute.mockRejectedValue(error);

      await expect(categoryViewModel.updateCategory(updatedData)).rejects.toThrow('Erro ao atualizar categoria');
    });

    it('should throw error when no category is set', async () => {
      const updatedData = {
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      await expect(categoryViewModel.updateCategory(updatedData)).rejects.toThrow('Nenhuma categoria selecionada para edição');
    });
  });

  describe('loadCategory', () => {
    it('should load category successfully', async () => {
      const categoryId = '1';
      mockGetCategoryByIdUseCase.execute.mockResolvedValue(mockCategory);

      const result = await categoryViewModel.loadCategory(categoryId);

      expect(mockGetCategoryByIdUseCase.execute).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
      expect(categoryViewModel.category).toEqual(mockCategory);
      expect(categoryViewModel.isEditing).toBe(true);
    });

    it('should handle load error', async () => {
      const categoryId = '1';
      const error = new Error('Categoria não encontrada');
      mockGetCategoryByIdUseCase.execute.mockRejectedValue(error);

      await expect(categoryViewModel.loadCategory(categoryId)).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('loadCategories', () => {
    it('should load categories successfully', async () => {
      const categories = [mockCategory];
      mockGetCategoriesUseCase.execute.mockResolvedValue(categories);

      const result = await categoryViewModel.loadCategories();

      expect(mockGetCategoriesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(categories);
      expect(categoryViewModel.categories).toEqual(categories);
    });

    it('should handle load error', async () => {
      const error = new Error('Erro ao carregar categorias');
      mockGetCategoriesUseCase.execute.mockRejectedValue(error);

      await expect(categoryViewModel.loadCategories()).rejects.toThrow('Erro ao carregar categorias');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const categoryId = '1';
      mockDeleteCategoryUseCase.execute.mockResolvedValue(true);

      const result = await categoryViewModel.deleteCategory(categoryId);

      expect(mockDeleteCategoryUseCase.execute).toHaveBeenCalledWith(categoryId);
      expect(result).toBe(true);
    });

    it('should handle delete error', async () => {
      const categoryId = '1';
      const error = new Error('Erro ao deletar categoria');
      mockDeleteCategoryUseCase.execute.mockRejectedValue(error);

      await expect(categoryViewModel.deleteCategory(categoryId)).rejects.toThrow('Erro ao deletar categoria');
    });
  });

  describe('getCategorySummary', () => {
    it('should return category summary when category exists', () => {
      categoryViewModel.setCategory(mockCategory);

      const summary = categoryViewModel.getCategorySummary();

      expect(summary).toEqual({
        id: '1',
        name: 'Alimentação',
        type: 'expense',
        transactionCount: 0,
      });
    });

    it('should return null when no category is set', () => {
      const summary = categoryViewModel.getCategorySummary();
      expect(summary).toBeNull();
    });
  });

  describe('getCategoriesByType', () => {
    it('should return categories filtered by type', () => {
      const expenseCategory = new Category({
        id: '1',
        name: 'Alimentação',
        type: 'expense',
      });

      const incomeCategory = new Category({
      id: '2',
        name: 'Salário',
        type: 'income',
      });

      categoryViewModel.setCategories([expenseCategory, incomeCategory]);

      const expenseCategories = categoryViewModel.getCategoriesByType('expense');
      const incomeCategories = categoryViewModel.getCategoriesByType('income');

      expect(expenseCategories).toEqual([expenseCategory]);
      expect(incomeCategories).toEqual([incomeCategory]);
    });

    it('should return empty array when no categories match type', () => {
      categoryViewModel.setCategories([]);

      const categories = categoryViewModel.getCategoriesByType('expense');

      expect(categories).toEqual([]);
    });
  });
});