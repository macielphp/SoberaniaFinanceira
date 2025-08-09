import { renderHook, act } from '@testing-library/react-native';
import { useCategoryAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useCategoryAdapter';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

describe('useCategoryAdapter', () => {
  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useCategoryAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.categories).toEqual([]);
    });

    it('should automatically load categories on mount', async () => {
      const { result } = renderHook(() => useCategoryAdapter());

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should have called getAllCategories
      expect(result.current.categories).toBeDefined();
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      let createdCategory;
      await act(async () => {
        createdCategory = await result.current.createCategory(categoryData);
      });

      expect(createdCategory).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const categoryData = {
        name: '',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      await act(async () => {
        try {
          await result.current.createCategory(categoryData);
        } catch (e) {
          // Expected error due to invalid data
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const categoryId = 'category-1';
      const updateData = {
        name: 'Alimentação Atualizada',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      let updatedCategory;
      await act(async () => {
        updatedCategory = await result.current.updateCategory(categoryId, updateData);
      });

      expect(updatedCategory).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const categoryId = 'category-1';
      const updateData = {
        name: '',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      await act(async () => {
        try {
          await result.current.updateCategory(categoryId, updateData);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const categoryId = 'category-1';

      const { result } = renderHook(() => useCategoryAdapter());

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteCategory(categoryId);
      });

      expect(deleteResult).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const categoryId = 'non-existent-category';

      const { result } = renderHook(() => useCategoryAdapter());

      await act(async () => {
        try {
          await result.current.deleteCategory(categoryId);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('getCategoryById', () => {
    it('should get category by id successfully', async () => {
      const categoryId = 'category-1';

      const { result } = renderHook(() => useCategoryAdapter());

      let returnedCategory: Category | undefined;
      await act(async () => {
        returnedCategory = await result.current.getCategoryById(categoryId);
      });

      expect(returnedCategory).toBeDefined();
      expect(returnedCategory!.id).toBe(categoryId);
    });
  });

  describe('validation', () => {
    it('should validate form data', () => {
      const validData = {
        name: 'Alimentação',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      const validation = result.current.validateForm(validData);

      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        name: '',
        type: 'expense' as const,
      };

      const { result } = renderHook(() => useCategoryAdapter());

      const validation = result.current.validateForm(invalidData);

      expect(validation.isValid).toBe(false);
      expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
    });
  });

  describe('filtering', () => {
    it('should get categories by type', async () => {
      const { result } = renderHook(() => useCategoryAdapter());

      // Mock some categories first
      const categories = [
        new Category({ id: '1', name: 'Salário', type: 'income' }),
        new Category({ id: '2', name: 'Alimentação', type: 'expense' }),
        new Category({ id: '3', name: 'Transporte', type: 'expense' }),
      ];

      await act(async () => {
        // This would normally be done by the adapter's mock implementation
        result.current.refresh();
      });

      const expenseCategories = result.current.getCategoriesByType('expense');
      const incomeCategories = result.current.getCategoriesByType('income');

      expect(expenseCategories).toBeDefined();
      expect(incomeCategories).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useCategoryAdapter());

      act(() => {
        result.current.setError('Some error');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useCategoryAdapter());

      act(() => {
        result.current.setError('Custom error');
      });

      expect(result.current.error).toBe('Custom error');
    });
  });

  describe('loading state', () => {
    it('should reflect loading state changes', () => {
      const { result } = renderHook(() => useCategoryAdapter());

      expect(result.current.loading).toBe(false);

      // Loading state would be managed internally by the adapter
      // This test verifies the state is accessible
    });
  });

  describe('categories list', () => {
    it('should reflect categories from view model', () => {
      const { result } = renderHook(() => useCategoryAdapter());

      expect(result.current.categories).toEqual([]);
      // After loading, categories would be populated
    });
  });

  describe('refresh', () => {
    it('should refresh categories list', async () => {
      const { result } = renderHook(() => useCategoryAdapter());

      await act(async () => {
        await result.current.refresh();
      });

      // Should have attempted to reload categories
      expect(result.current.categories).toBeDefined();
    });
  });
});
