// UI Adapter: useBudgetAdapter
// Hook React para interagir com BudgetViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { useState, useCallback } from 'react';
import { BudgetViewModel, CreateBudgetDTO, UpdateBudgetDTO } from '../view-models/BudgetViewModel';
import { Budget } from '../../domain/entities/Budget';
import { Money } from '../../shared/utils/Money';

export interface UseBudgetAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  budgets: Budget[];
  selectedBudget: Budget | null;
  renderCount: number;

  // Actions
  loadBudgets: () => Promise<void>;
  createBudget: (data: CreateBudgetDTO) => Promise<Budget>;
  updateBudget: (id: string, data: UpdateBudgetDTO) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  selectBudget: (budget: Budget) => void;
  clearSelection: () => void;
  setError: (error: string) => void;
  clearError: () => void;
  forceUpdate: () => void;
}

export function useBudgetAdapter(
  viewModel?: BudgetViewModel
): UseBudgetAdapterResult {
  // Create ViewModel instance if not provided
  const [budgetViewModel] = useState(() => {
    if (viewModel) {
      return viewModel;
    }
    
    // Create default ViewModel with mock dependencies
    // In a real app, these would be injected via DI container
    const mockBudgetRepository = {
      findAll: async () => [],
      findById: async (id: string) => null,
      create: async (budget: Budget) => budget,
      update: async (budget: Budget) => budget,
      delete: async (id: string) => {},
    };

    const mockBudgetItemRepository = {
      findByBudgetId: async (budgetId: string) => [],
    };

    return new BudgetViewModel(mockBudgetRepository as any, mockBudgetItemRepository as any);
  });

  // State management
  const [renderCount, setRenderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Force update mechanism
  const forceUpdate = useCallback(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Actions
  const loadBudgets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await budgetViewModel.loadBudgets();
      setBudgets(budgetViewModel.budgets);
      forceUpdate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar orçamentos';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetViewModel, forceUpdate]);

  const createBudget = useCallback(async (data: CreateBudgetDTO): Promise<Budget> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await budgetViewModel.createBudget(data);
      
      if (result.isSuccess()) {
        const budget = result.getOrThrow();
        setBudgets(prev => [...prev, budget]);
        forceUpdate();
        return budget;
      } else {
        const error = result.getOrThrow();
        setError(error instanceof Error ? error.message : 'Erro ao criar orçamento');
        setLoading(false);
        forceUpdate();
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar orçamento';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetViewModel, forceUpdate]);

  const updateBudget = useCallback(async (id: string, data: UpdateBudgetDTO): Promise<Budget> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await budgetViewModel.updateBudget(id, data);
      
      if (result.isSuccess()) {
        const budget = result.getOrThrow();
        setBudgets(prev => prev.map(b => b.id === id ? budget : b));
        forceUpdate();
        return budget;
      } else {
        const error = result.getOrThrow();
        setError(error instanceof Error ? error.message : 'Erro ao atualizar orçamento');
        setLoading(false);
        forceUpdate();
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar orçamento';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetViewModel, forceUpdate]);

  const deleteBudget = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await budgetViewModel.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      forceUpdate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar orçamento';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [budgetViewModel, forceUpdate]);

  const selectBudget = useCallback((budget: Budget) => {
    budgetViewModel.selectBudget(budget.id);
    setSelectedBudget(budget);
    forceUpdate();
  }, [budgetViewModel, forceUpdate]);

  const clearSelection = useCallback(() => {
    setSelectedBudget(null);
    forceUpdate();
  }, [forceUpdate]);

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
    budgets,
    selectedBudget,
    renderCount,

    // Actions
    loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    selectBudget,
    clearSelection,
    setError: setCustomError,
    clearError: clearCustomError,
    forceUpdate,
  };
}
