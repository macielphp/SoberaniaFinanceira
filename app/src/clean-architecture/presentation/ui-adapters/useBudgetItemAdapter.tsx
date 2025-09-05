// UI Adapter: useBudgetItemAdapter
// Hook React para interagir com BudgetItemViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { useState, useCallback, useEffect } from 'react';
import { BudgetItemViewModel } from '../view-models/BudgetItemViewModel';
import { BudgetItem } from '../../domain/entities/BudgetItem';
import { Money } from '../../shared/utils/Money';

// Types for budget item data
export interface CreateBudgetItemData {
  budgetId: string;
  categoryName: string;
  plannedValue: Money;
  categoryType: 'expense' | 'income';
}

export interface UseBudgetItemAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  budgetItems: BudgetItem[];
  renderCount: number;

  // Actions
  createBudgetItem: (data: CreateBudgetItemData) => Promise<BudgetItem>;
  getBudgetItems: (budgetId: string, categoryName?: string) => Promise<BudgetItem[]>;
  setError: (error: string) => void;
  clearError: () => void;
  forceUpdate: () => void;
}

export function useBudgetItemAdapter(
  viewModel?: BudgetItemViewModel
): UseBudgetItemAdapterResult {
  // Create ViewModel instance if not provided
  const [budgetItemViewModel] = useState(() => {
    if (viewModel) {
      return viewModel;
    }
    
    // Create default ViewModel with mock dependencies
    // In a real app, these would be injected via DI container
    const mockCreateUseCase = {
      execute: async (data: any) => {
        return {
          isSuccess: () => true,
          isFailure: () => false,
          getOrThrow: () => ({
            budgetItem: new BudgetItem({
              id: 'mock-id',
              budgetId: data.budgetId,
              categoryName: data.categoryName,
              plannedValue: data.plannedValue,
              categoryType: data.categoryType,
              createdAt: new Date(),
            }),
          }),
        };
      },
    };

    const mockGetUseCase = {
      execute: async (data: any) => {
        return {
          isSuccess: () => true,
          isFailure: () => false,
          getOrThrow: () => ({
            budgetItems: [],
          }),
        };
      },
    };

    return new BudgetItemViewModel(mockCreateUseCase as any, mockGetUseCase as any);
  });

  // State management
  const [renderCount, setRenderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  // Force update mechanism
  const forceUpdate = useCallback(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Actions
  const createBudgetItem = useCallback(async (data: CreateBudgetItemData): Promise<BudgetItem> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await budgetItemViewModel.createBudgetItem(data);
      
      if (result.isSuccess()) {
        const response = result.getOrThrow();
        setBudgetItems(prev => [...prev, response.budgetItem]);
        forceUpdate();
        return response.budgetItem;
      } else {
        const error = result.getOrThrow();
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        forceUpdate();
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar item de orçamento';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetItemViewModel, forceUpdate]);

  const getBudgetItems = useCallback(async (budgetId: string, categoryName?: string): Promise<BudgetItem[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const request = { budgetId, categoryName };
      const result = await budgetItemViewModel.getBudgetItems(request);
      
      if (result.isSuccess()) {
        const response = result.getOrThrow();
        setBudgetItems(response.budgetItems);
        forceUpdate();
        return response.budgetItems;
      } else {
        const error = result.getOrThrow();
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        forceUpdate();
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar itens de orçamento';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetItemViewModel, forceUpdate]);

  const setCustomError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    forceUpdate();
  }, [forceUpdate]);

  const clearCustomError = useCallback(() => {
    setError(null);
    forceUpdate();
  }, [forceUpdate]);

  return {
    // State
    loading,
    error,
    budgetItems,
    renderCount,

    // Actions
    createBudgetItem,
    getBudgetItems,
    setError: setCustomError,
    clearError: clearCustomError,
    forceUpdate,
  };
}
