import { useApplicationStoreAdapter } from './useApplicationStoreAdapter';
import { useOperationViewModelAdapter } from './useOperationViewModelAdapter';
import { useCategoryViewModelAdapter } from './useCategoryViewModelAdapter';
import { useAccountViewModelAdapter } from './useAccountViewModelAdapter';
import { useOperationSummaryViewModelAdapter } from './useOperationSummaryViewModelAdapter';

/**
 * Adapter de Compatibilidade para migração gradual do FinanceContext
 * 
 * Este adapter permite que componentes existentes continuem funcionando
 * enquanto migramos gradualmente para o novo sistema de Clean Architecture.
 * 
 * Funcionalidades:
 * - Mantém a interface do useFinance() existente
 * - Conecta com os novos ViewModels via adapters
 * - Permite migração gradual componente por componente
 * - Mantém compatibilidade durante a transição
 */
export const useFinanceContextAdapter = () => {
  // Novos adapters do Clean Architecture
  const operationAdapter = useOperationViewModelAdapter();
  const categoryAdapter = useCategoryViewModelAdapter();
  const accountAdapter = useAccountViewModelAdapter();
  const operationSummaryAdapter = useOperationSummaryViewModelAdapter();
  const applicationStore = useApplicationStoreAdapter();

  // Interface de compatibilidade com o FinanceContext existente
  return {
    // Estados básicos
    operations: operationAdapter.operations,
    categories: categoryAdapter.categories,
    accounts: accountAdapter.accounts,
    loading: applicationStore.loading,
    error: applicationStore.error,

    // Financial Summary - Estados
    selectedPeriod: operationSummaryAdapter.selectedPeriod,
    monthOptions: [], // TODO: Implementar no OperationSummaryViewModel
    financialSummary: operationSummaryAdapter.getFinancialSummary(),
    filteredOperations: operationSummaryAdapter.getFilteredOperations(),

    // Monthly Summary - Estados Globais
    includeVariableIncome: operationSummaryAdapter.includeVariableIncome,
    setIncludeVariableIncome: operationSummaryAdapter.setIncludeVariableIncome,

    // Budget - Estados (TODO: Implementar BudgetViewModel)
    activeBudget: null,
    budgetLoading: false,
    selectedBudgetMonth: '',
    monthlyBudgetPerformance: null,

    // Operações
    createSimpleOperation: operationAdapter.createOperation,
    createDoubleOperation: async (operationData: any) => {
      // TODO: Implementar lógica de operação dupla
      const operation = await operationAdapter.createOperation(operationData);
      return [operation];
    },
    updateOperation: operationAdapter.updateOperation,
    updateOperationState: async (operation: any, newState: any) => {
      return operationAdapter.updateOperation(operation.id, { state: newState });
    },
    removeOperation: operationAdapter.deleteOperation,

    // Filtros
    filterOperations: (filters: any) => {
      // TODO: Implementar filtros no OperationViewModel
      return operationAdapter.operations.filter(op => {
        if (filters.nature && op.nature !== filters.nature) return false;
        if (filters.state && op.state !== filters.state) return false;
        if (filters.category && op.category !== filters.category) return false;
        if (filters.account && op.account !== filters.account) return false;
        // TODO: Implementar filtros de data
        return true;
      });
    },

    // Categorias
    createCategory: categoryAdapter.createCategory,
    editCategory: categoryAdapter.updateCategory,
    removeCategory: categoryAdapter.deleteCategory,
    getCategoryNames: () => categoryAdapter.categories.map(cat => cat.name),
    getCategoryNamesByType: (type: 'income' | 'expense') => 
      categoryAdapter.categories
        .filter(cat => cat.type === type)
        .map(cat => cat.name),

    // Contas
    createAccount: accountAdapter.createAccount,
    editAccount: accountAdapter.updateAccount,
    removeAccount: accountAdapter.deleteAccount,
    getAccountNames: () => accountAdapter.accounts.map(acc => acc.name),

    // Budget - Funções (TODO: Implementar BudgetViewModel)
    createManualBudget: async () => { throw new Error('Not implemented yet'); },
    createAutomaticBudget: async () => { throw new Error('Not implemented yet'); },
    updateBudget: async () => { throw new Error('Not implemented yet'); },
    deleteBudget: async () => { throw new Error('Not implemented yet'); },
    getBudgetPerformance: async () => { throw new Error('Not implemented yet'); },
    getHistoricalDataForBudget: async () => { throw new Error('Not implemented yet'); },
    refreshActiveBudget: async () => { throw new Error('Not implemented yet'); },
    loadMonthlyBudgetPerformance: async () => { throw new Error('Not implemented yet'); },

    // Financial Summary - Funções
    setSelectedPeriod: operationSummaryAdapter.setSelectedPeriod,
    formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
    getSelectedPeriodLabel: () => {
      const period = operationSummaryAdapter.selectedPeriod;
      switch (period) {
        case 'all': return 'Todos os períodos';
        case 'month': return 'Este mês';
        case 'quarter': return 'Este trimestre';
        case 'year': return 'Este ano';
        default: return 'Período selecionado';
      }
    },
    getCategoryStats: () => {
      // TODO: Implementar no OperationSummaryViewModel
      return [];
    },
    getDateRange: (periodValue: string) => {
      // TODO: Implementar lógica de range de datas
      return { startDate: undefined, endDate: undefined };
    },

    // Utilitários
    refreshAllData: async () => {
      await Promise.all([
        operationAdapter.refreshOperations(),
        categoryAdapter.refreshCategories(),
        accountAdapter.refreshAccounts(),
      ]);
    },
    clearError: applicationStore.clearError,

    // Goals (TODO: Implementar GoalViewModel)
    goals: [],
    createGoal: async () => { throw new Error('Not implemented yet'); },
    updateGoal: async () => { throw new Error('Not implemented yet'); },
    deleteGoal: async () => { throw new Error('Not implemented yet'); },
    getGoalById: async () => { throw new Error('Not implemented yet'); },
  };
};

/**
 * Hook de compatibilidade que pode ser usado como drop-in replacement
 * para o useFinance() existente
 */
export const useFinance = useFinanceContextAdapter;
