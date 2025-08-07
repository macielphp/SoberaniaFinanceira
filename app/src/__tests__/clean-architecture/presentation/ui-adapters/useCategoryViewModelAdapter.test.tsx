import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useCategoryViewModelAdapter } from '@/clean-architecture/presentation/ui-adapters/useCategoryViewModelAdapter';
import { CategoryViewModel } from '@/clean-architecture/presentation/view-models/CategoryViewModel';
import { container } from '@/clean-architecture/shared/di/Container';

// Mock the container
jest.mock('@/clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock CategoryViewModel
jest.mock('@/clean-architecture/presentation/view-models/CategoryViewModel', () => ({
  CategoryViewModel: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useCategoryViewModelAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('useCategoryViewModelAdapter', () => {
  let mockCategoryViewModel: any;

  beforeEach(() => {
    mockCategoryViewModel = {
      categories: [],
      loading: false,
      error: null,
      selectedCategory: null,
      getCategories: jest.fn().mockReturnValue([]),
      getCategoryById: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      setSelectedCategory: jest.fn(),
      clearSelectedCategory: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshCategories: jest.fn(),
    };

    (container.resolve as jest.Mock).mockReturnValue(mockCategoryViewModel);
    (CategoryViewModel as jest.Mock).mockImplementation(() => mockCategoryViewModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult).toBeDefined();
    expect(hookResult.categories).toEqual([]);
    expect(hookResult.loading).toBe(false);
    expect(hookResult.error).toBe(null);
    expect(hookResult.selectedCategory).toBe(null);
  });

  it('should provide all required properties in return interface', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const expectedProperties = [
      'categories',
      'loading',
      'error',
      'selectedCategory',
      'getCategories',
      'getCategoryById',
      'createCategory',
      'updateCategory',
      'deleteCategory',
      'setSelectedCategory',
      'clearSelectedCategory',
      'setLoading',
      'setError',
      'clearError',
      'refreshCategories'
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for CategoryViewModel when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('CategoryViewModel');
  });

  it('should provide action functions that call view model methods', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test createCategory
    act(() => {
      hookResult.createCategory({ name: 'Alimentação', type: 'despesa' });
    });
    expect(mockCategoryViewModel.createCategory).toHaveBeenCalledWith({ name: 'Alimentação', type: 'despesa' });

    // Test updateCategory
    act(() => {
      hookResult.updateCategory('test-id', { name: 'Alimentação Atualizada' });
    });
    expect(mockCategoryViewModel.updateCategory).toHaveBeenCalledWith('test-id', { name: 'Alimentação Atualizada' });

    // Test deleteCategory
    act(() => {
      hookResult.deleteCategory('test-id');
    });
    expect(mockCategoryViewModel.deleteCategory).toHaveBeenCalledWith('test-id');

    // Test setSelectedCategory
    act(() => {
      hookResult.setSelectedCategory({ id: 'test-id', name: 'Alimentação' });
    });
    expect(mockCategoryViewModel.setSelectedCategory).toHaveBeenCalledWith({ id: 'test-id', name: 'Alimentação' });

    // Test clearSelectedCategory
    act(() => {
      hookResult.clearSelectedCategory();
    });
    expect(mockCategoryViewModel.clearSelectedCategory).toHaveBeenCalled();

    // Test setLoading
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockCategoryViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setError
    act(() => {
      hookResult.setError('Test error');
    });
    expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Test error');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockCategoryViewModel.clearError).toHaveBeenCalled();

    // Test refreshCategories
    act(() => {
      hookResult.refreshCategories();
    });
    expect(mockCategoryViewModel.refreshCategories).toHaveBeenCalled();
  });

  it('should provide getter functions that call view model methods', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test getCategories
    act(() => {
      hookResult.getCategories();
    });
    expect(mockCategoryViewModel.getCategories).toHaveBeenCalled();

    // Test getCategoryById
    act(() => {
      hookResult.getCategoryById('test-id');
    });
    expect(mockCategoryViewModel.getCategoryById).toHaveBeenCalledWith('test-id');
  });

  it('should provide state properties from view model', () => {
    // Mock view model with specific state
    const mockState = {
      categories: [{ id: '1', name: 'Alimentação', type: 'despesa' }],
      loading: true,
      error: 'Test error',
      selectedCategory: { id: '1', name: 'Alimentação' },
    };

    mockCategoryViewModel.categories = mockState.categories;
    mockCategoryViewModel.loading = mockState.loading;
    mockCategoryViewModel.error = mockState.error;
    mockCategoryViewModel.selectedCategory = mockState.selectedCategory;

    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult.categories).toEqual(mockState.categories);
    expect(hookResult.loading).toBe(mockState.loading);
    expect(hookResult.error).toBe(mockState.error);
    expect(hookResult.selectedCategory).toEqual(mockState.selectedCategory);
  });

  it('should handle async operations correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Mock async operations
    const mockCreateCategory = jest.fn().mockResolvedValue({ id: 'new-id', name: 'Nova Categoria' });
    const mockUpdateCategory = jest.fn().mockResolvedValue({ id: 'updated-id', name: 'Categoria Atualizada' });
    const mockDeleteCategory = jest.fn().mockResolvedValue(true);
    const mockRefreshCategories = jest.fn().mockResolvedValue([]);

    hookResult.createCategory = mockCreateCategory;
    hookResult.updateCategory = mockUpdateCategory;
    hookResult.deleteCategory = mockDeleteCategory;
    hookResult.refreshCategories = mockRefreshCategories;

    // Test async createCategory
    await act(async () => {
      const result = await hookResult.createCategory({ name: 'Nova Categoria', type: 'despesa' });
      expect(result).toEqual({ id: 'new-id', name: 'Nova Categoria' });
    });
    expect(mockCreateCategory).toHaveBeenCalledWith({ name: 'Nova Categoria', type: 'despesa' });

    // Test async updateCategory
    await act(async () => {
      const result = await hookResult.updateCategory('test-id', { name: 'Categoria Atualizada' });
      expect(result).toEqual({ id: 'updated-id', name: 'Categoria Atualizada' });
    });
    expect(mockUpdateCategory).toHaveBeenCalledWith('test-id', { name: 'Categoria Atualizada' });

    // Test async deleteCategory
    await act(async () => {
      const result = await hookResult.deleteCategory('test-id');
      expect(result).toBe(true);
    });
    expect(mockDeleteCategory).toHaveBeenCalledWith('test-id');

    // Test async refreshCategories
    await act(async () => {
      const result = await hookResult.refreshCategories();
      expect(result).toEqual([]);
    });
    expect(mockRefreshCategories).toHaveBeenCalled();
  });

  it('should handle category selection correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const testCategory = { id: '1', name: 'Alimentação', type: 'despesa' };

    // Test setSelectedCategory
    act(() => {
      hookResult.setSelectedCategory(testCategory);
    });
    expect(mockCategoryViewModel.setSelectedCategory).toHaveBeenCalledWith(testCategory);

    // Test clearSelectedCategory
    act(() => {
      hookResult.clearSelectedCategory();
    });
    expect(mockCategoryViewModel.clearSelectedCategory).toHaveBeenCalled();
  });

  it('should handle category CRUD operations correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const newCategory = { name: 'Transporte', type: 'despesa' };
    const updateData = { name: 'Transporte Atualizado' };

    // Test create
    act(() => {
      hookResult.createCategory(newCategory);
    });
    expect(mockCategoryViewModel.createCategory).toHaveBeenCalledWith(newCategory);

    // Test update
    act(() => {
      hookResult.updateCategory('test-id', updateData);
    });
    expect(mockCategoryViewModel.updateCategory).toHaveBeenCalledWith('test-id', updateData);

    // Test delete
    act(() => {
      hookResult.deleteCategory('test-id');
    });
    expect(mockCategoryViewModel.deleteCategory).toHaveBeenCalledWith('test-id');
  });

  it('should handle error states correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setError
    act(() => {
      hookResult.setError('Erro ao carregar categorias');
    });
    expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Erro ao carregar categorias');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockCategoryViewModel.clearError).toHaveBeenCalled();
  });

  it('should handle loading states correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setLoading to true
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockCategoryViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setLoading to false
    act(() => {
      hookResult.setLoading(false);
    });
    expect(mockCategoryViewModel.setLoading).toHaveBeenCalledWith(false);
  });
});
