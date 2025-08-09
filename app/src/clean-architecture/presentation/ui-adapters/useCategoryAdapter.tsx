import { useState, useCallback, useEffect } from 'react';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { Category } from '../../domain/entities/Category';

// Interfaces para Create/Update categorias
export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
}

export interface UpdateCategoryData {
  name: string;
  type: 'income' | 'expense';
}

export interface UseCategoryAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  category: Category | null;
  categories: Category[];
  isEditing: boolean;
  
  // Actions
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Promise<Category>;
  refresh: () => Promise<Category[]>;
  
  // State management
  setCategory: (category: Category | null) => void;
  reset: () => void;
  
  // Validation
  validateForm: (data: CreateCategoryData) => { isValid: boolean; errors: Record<string, string> };
  
  // Utility
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
  getCategorySummary: () => any;
  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
}

export function useCategoryAdapter(): UseCategoryAdapterResult {
  // Initialize ViewModel com mocks dos Use Cases
  const [viewModel] = useState(() => {
    // Mocks dos Use Cases
    const mockCreateUseCase = {
      execute: async (data: CreateCategoryData) => {
        if (!data.name || data.name.trim() === '') {
          throw new Error('Name is required');
        }
        const category = new Category({
          id: 'mock-category-' + Date.now(),
          name: data.name,
          type: data.type,
        });
        return category;
      }
    };

    const mockUpdateUseCase = {
      execute: async (id: string, data: UpdateCategoryData) => {
        if (!data.name || data.name.trim() === '') {
          throw new Error('Name is required');
        }
        const category = new Category({
          id,
          name: data.name,
          type: data.type,
        });
        return category;
      }
    };

    const mockGetByIdUseCase = {
      execute: async (id: string) => {
        const category = new Category({
          id,
          name: 'Mock Category',
          type: 'expense',
        });
        return category;
      }
    };

    const mockGetCategoriesUseCase = {
      execute: async () => {
        const categories = [
          new Category({ id: '1', name: 'Salário', type: 'income' }),
          new Category({ id: '2', name: 'Alimentação', type: 'expense' }),
          new Category({ id: '3', name: 'Transporte', type: 'expense' }),
        ];
        return categories;
      }
    };

    const mockDeleteUseCase = {
      execute: async (id: string) => {
        if (id === 'non-existent-category') {
          throw new Error('Category not found');
        }
        return true;
      }
    };

    return new CategoryViewModel(
      mockCreateUseCase,
      mockUpdateUseCase,
      mockGetByIdUseCase,
      mockGetCategoriesUseCase,
      mockDeleteUseCase
    );
  });

  // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(prev => prev + 1), []);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await viewModel.loadCategories();
        forceUpdate();
      } catch (error) {
        // Error is handled by the ViewModel
        forceUpdate();
      }
    };

    loadCategories();
  }, [viewModel, forceUpdate]);

  // Category actions
  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category> => {
    try {
      const result = await viewModel.createCategory(data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryData): Promise<Category> => {
    try {
      // Se não há categoria carregada, carrega primeiro
      if (!viewModel.category || viewModel.category.id !== id) {
        await viewModel.loadCategory(id);
      }
      
      const result = await viewModel.updateCategory(data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await viewModel.deleteCategory(id);
      // Recarrega a lista após deletar
      await viewModel.loadCategories();
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const getCategoryById = useCallback(async (id: string): Promise<Category> => {
    try {
      const result = await viewModel.loadCategory(id);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const refresh = useCallback(async (): Promise<Category[]> => {
    try {
      const result = await viewModel.loadCategories();
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  // State management
  const setCategory = useCallback((category: Category | null) => {
    viewModel.setCategory(category);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  const reset = useCallback(() => {
    viewModel.reset();
    forceUpdate();
  }, [viewModel, forceUpdate]);

  // Validation
  const validateForm = useCallback((data: CreateCategoryData) => {
    return viewModel.validateForm(data);
  }, [viewModel]);

  // Utility
  const getCategoriesByType = useCallback((type: 'income' | 'expense'): Category[] => {
    return viewModel.getCategoriesByType(type);
  }, [viewModel]);

  const getCategorySummary = useCallback(() => {
    return viewModel.getCategorySummary();
  }, [viewModel]);

  // Error handling
  const clearError = useCallback(() => {
    viewModel.setError(null);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  const setError = useCallback((error: string) => {
    viewModel.setError(error);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  return {
    // State from ViewModel
    loading: viewModel.isLoading,
    error: viewModel.error,
    category: viewModel.category,
    categories: viewModel.categories,
    isEditing: viewModel.isEditing,
    
    // Actions
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refresh,
    
    // State management
    setCategory,
    reset,
    
    // Validation
    validateForm,
    
    // Utility
    getCategoriesByType,
    getCategorySummary,
    
    // Error handling
    clearError,
    setError,
  };
}
