import { useState, useCallback, useEffect } from 'react';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { Category, CategoryType, CategoryProps } from '../../domain/entities/Category';
import { container } from '../../shared/di/Container';

export const useCategoryViewModelAdapter = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewModel = container.resolve<CategoryViewModel>('CategoryViewModel');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.loadCategories();
      setCategories([...viewModel.categories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  const createCategory = useCallback(async (categoryProps: Omit<CategoryProps, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const categoryWithId = { ...categoryProps, id: Date.now().toString() };
      await viewModel.createCategory(categoryWithId);
      setCategories([...viewModel.categories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  const updateCategory = useCallback(async (category: Category) => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.updateCategory(category);
      setCategories([...viewModel.categories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  const deleteCategory = useCallback(async (category: Category) => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.deleteCategory(category.id);
      setCategories([...viewModel.categories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  // Carregar categorias automaticamente quando o hook é inicializado
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
  };
}; 