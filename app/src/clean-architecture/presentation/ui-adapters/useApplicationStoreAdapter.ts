import { useState, useEffect, useCallback } from 'react';
import { ApplicationStore, AppState, FinancialSummary } from '../../shared/state/ApplicationStore';
import { EventBus } from '../../shared/events/EventBus';
import { container } from '../../shared/di/Container';

export interface UseApplicationStoreAdapterReturn {
  // State
  operations: AppState['operations'];
  accounts: AppState['accounts'];
  categories: AppState['categories'];
  goals: AppState['goals'];
  loading: AppState['loading'];
  error: AppState['error'];
  selectedPeriod: AppState['selectedPeriod'];
  includeVariableIncome: AppState['includeVariableIncome'];
  
  // Computed values
  financialSummary: FinancialSummary;
  filteredOperations: AppState['operations'];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSelectedPeriod: (period: string) => void;
  setIncludeVariableIncome: (include: boolean) => void;
  
  // Utility methods
  refreshData: () => Promise<void>;
}

export const useApplicationStoreAdapter = (): UseApplicationStoreAdapterReturn => {
  const [state, setState] = useState<AppState>({
    operations: [],
    accounts: [],
    categories: [],
    goals: [],
    loading: false,
    error: null,
    selectedPeriod: 'all',
    includeVariableIncome: false,
  });

  const [store, setStore] = useState<ApplicationStore | null>(null);

  // Initialize store
  useEffect(() => {
    const eventBus = container.resolve<EventBus>('EventBus');
    const applicationStore = new ApplicationStore(eventBus);
    setStore(applicationStore);

    // Subscribe to state changes
    const unsubscribe = applicationStore.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
      applicationStore.destroy();
    };
  }, []);

  // Computed values
  const financialSummary = store?.getFinancialSummary() || {
    totalReceitas: 0,
    totalDespesas: 0,
    saldoLiquido: 0,
    receitasPendentes: 0,
    despesasPendentes: 0,
    totalOperacoes: 0,
    operacoesPendentes: 0,
  };

  const filteredOperations = store?.getFilteredOperations() || [];

  // Actions
  const setLoading = useCallback((loading: boolean) => {
    store?.setLoading(loading);
  }, [store]);

  const setError = useCallback((error: string | null) => {
    store?.setError(error);
  }, [store]);

  const clearError = useCallback(() => {
    store?.clearError();
  }, [store]);

  const setSelectedPeriod = useCallback((period: string) => {
    store?.setSelectedPeriod(period);
  }, [store]);

  const setIncludeVariableIncome = useCallback((include: boolean) => {
    store?.setIncludeVariableIncome(include);
  }, [store]);

  const refreshData = useCallback(async () => {
    if (!store) return;
    
    setLoading(true);
    try {
      // Here you would typically load data from repositories
      // For now, we'll just clear the error
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  }, [store, setLoading, clearError, setError]);

  return {
    // State
    operations: state.operations,
    accounts: state.accounts,
    categories: state.categories,
    goals: state.goals,
    loading: state.loading,
    error: state.error,
    selectedPeriod: state.selectedPeriod,
    includeVariableIncome: state.includeVariableIncome,
    
    // Computed values
    financialSummary,
    filteredOperations,
    
    // Actions
    setLoading,
    setError,
    clearError,
    setSelectedPeriod,
    setIncludeVariableIncome,
    
    // Utility methods
    refreshData,
  };
};
