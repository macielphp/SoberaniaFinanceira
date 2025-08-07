import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useFinanceContextAdapter } from '../../../clean-architecture/presentation/ui-adapters/FinanceContextAdapter';
import { container } from '../../../clean-architecture/shared/di/Container';

// Mock the container
jest.mock('../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock all view models
jest.mock('../../../clean-architecture/presentation/view-models/OperationViewModel', () => ({
  OperationViewModel: jest.fn(),
}));

jest.mock('../../../clean-architecture/presentation/view-models/CategoryViewModel', () => ({
  CategoryViewModel: jest.fn(),
}));

jest.mock('../../../clean-architecture/presentation/view-models/AccountViewModel', () => ({
  AccountViewModel: jest.fn(),
}));

jest.mock('../../../clean-architecture/presentation/view-models/OperationSummaryViewModel', () => ({
  OperationSummaryViewModel: jest.fn(),
}));

jest.mock('../../../clean-architecture/shared/state/ApplicationStore', () => ({
  ApplicationStore: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useFinanceContextAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('FinanceContextAdapter', () => {
  let mockOperationViewModel: any;
  let mockCategoryViewModel: any;
  let mockAccountViewModel: any;
  let mockOperationSummaryViewModel: any;
  let mockApplicationStore: any;

  beforeEach(() => {
    // Mock OperationViewModel
    mockOperationViewModel = {
      operations: [],
      loading: false,
      error: null,
      selectedOperation: null,
      getOperations: jest.fn().mockReturnValue([]),
      getOperationById: jest.fn(),
      createOperation: jest.fn().mockResolvedValue({ id: 'new-op', nature: 'despesa', value: 100 }),
      updateOperation: jest.fn().mockResolvedValue({ id: 'updated-op' }),
      deleteOperation: jest.fn().mockResolvedValue(true),
      setSelectedOperation: jest.fn(),
      clearSelectedOperation: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshOperations: jest.fn().mockResolvedValue([]),
    };

    // Mock CategoryViewModel
    mockCategoryViewModel = {
      categories: [],
      loading: false,
      error: null,
      selectedCategory: null,
      getCategories: jest.fn().mockReturnValue([]),
      getCategoryById: jest.fn(),
      createCategory: jest.fn().mockResolvedValue({ id: 'new-cat', name: 'Nova Categoria' }),
      updateCategory: jest.fn().mockResolvedValue({ id: 'updated-cat' }),
      deleteCategory: jest.fn().mockResolvedValue(true),
      setSelectedCategory: jest.fn(),
      clearSelectedCategory: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshCategories: jest.fn().mockResolvedValue([]),
    };

    // Mock AccountViewModel
    mockAccountViewModel = {
      accounts: [],
      loading: false,
      error: null,
      selectedAccount: null,
      getAccounts: jest.fn().mockReturnValue([]),
      getAccountById: jest.fn(),
      createAccount: jest.fn().mockResolvedValue({ id: 'new-acc', name: 'Nova Conta' }),
      updateAccount: jest.fn().mockResolvedValue({ id: 'updated-acc' }),
      deleteAccount: jest.fn().mockResolvedValue(true),
      setSelectedAccount: jest.fn(),
      clearSelectedAccount: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshAccounts: jest.fn().mockResolvedValue([]),
    };

    // Mock OperationSummaryViewModel
    mockOperationSummaryViewModel = {
      operations: [],
      loading: false,
      error: null,
      selectedPeriod: 'all',
      includeVariableIncome: false,
      getOperations: jest.fn().mockReturnValue([]),
      getFilteredOperations: jest.fn().mockReturnValue([]),
      getFinancialSummary: jest.fn().mockReturnValue({
        totalReceitas: 0,
        totalDespesas: 0,
        saldoLiquido: 0,
        receitasPendentes: 0,
        despesasPendentes: 0,
        totalOperacoes: 0,
        operacoesPendentes: 0,
      }),
      setSelectedPeriod: jest.fn(),
      setIncludeVariableIncome: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshData: jest.fn().mockResolvedValue(true),
    };

    // Mock ApplicationStore
    mockApplicationStore = {
      loading: false,
      error: null,
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
    };

    // Setup container mocks
    (container.resolve as jest.Mock)
      .mockReturnValueOnce(mockOperationViewModel)
      .mockReturnValueOnce(mockCategoryViewModel)
      .mockReturnValueOnce(mockAccountViewModel)
      .mockReturnValueOnce(mockOperationSummaryViewModel)
      .mockReturnValueOnce(mockApplicationStore);
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
    expect(hookResult.operations).toEqual([]);
    expect(hookResult.categories).toEqual([]);
    expect(hookResult.accounts).toEqual([]);
    expect(hookResult.loading).toBe(false);
    expect(hookResult.error).toBe(null);
    expect(hookResult.selectedPeriod).toBe('all');
    expect(hookResult.includeVariableIncome).toBe(false);
  });

  it('should provide all required properties for compatibility', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const expectedProperties = [
      'operations',
      'categories',
      'accounts',
      'loading',
      'error',
      'selectedPeriod',
      'monthOptions',
      'financialSummary',
      'filteredOperations',
      'includeVariableIncome',
      'setIncludeVariableIncome',
      'activeBudget',
      'budgetLoading',
      'selectedBudgetMonth',
      'monthlyBudgetPerformance',
      'createSimpleOperation',
      'createDoubleOperation',
      'updateOperation',
      'updateOperationState',
      'removeOperation',
      'filterOperations',
      'createCategory',
      'editCategory',
      'removeCategory',
      'getCategoryNames',
      'getCategoryNamesByType',
      'createAccount',
      'editAccount',
      'removeAccount',
      'getAccountNames',
      'setSelectedPeriod',
      'formatCurrency',
      'getSelectedPeriodLabel',
      'getCategoryStats',
      'getDateRange',
      'refreshAllData',
      'clearError',
      'goals',
      'createGoal',
      'updateGoal',
      'deleteGoal',
      'getGoalById',
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should handle operation CRUD operations correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test createSimpleOperation
    await act(async () => {
      const result = await hookResult.createSimpleOperation({ nature: 'despesa', value: 100 });
      expect(result).toEqual({ id: 'new-op', nature: 'despesa', value: 100 });
    });
    expect(mockOperationViewModel.createOperation).toHaveBeenCalledWith({ nature: 'despesa', value: 100 });

    // Test updateOperation
    await act(async () => {
      const result = await hookResult.updateOperation({ id: 'test-id', value: 200 });
      expect(result).toEqual({ id: 'updated-op' });
    });
    expect(mockOperationViewModel.updateOperation).toHaveBeenCalledWith({ id: 'test-id', value: 200 });

    // Test removeOperation
    await act(async () => {
      await hookResult.removeOperation('test-id');
    });
    expect(mockOperationViewModel.deleteOperation).toHaveBeenCalledWith('test-id');
  });

  it('should handle category operations correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test createCategory
    await act(async () => {
      const result = await hookResult.createCategory('Nova Categoria', 'expense');
      expect(result).toEqual({ id: 'new-cat', name: 'Nova Categoria' });
    });
    expect(mockCategoryViewModel.createCategory).toHaveBeenCalledWith('Nova Categoria', 'expense');

    // Test editCategory
    await act(async () => {
      const result = await hookResult.editCategory('test-id', 'Categoria Atualizada', 'expense');
      expect(result).toEqual({ id: 'updated-cat' });
    });
    expect(mockCategoryViewModel.updateCategory).toHaveBeenCalledWith('test-id', 'Categoria Atualizada', 'expense');

    // Test removeCategory
    await act(async () => {
      const result = await hookResult.removeCategory('test-id');
      expect(result).toBe(true);
    });
    expect(mockCategoryViewModel.deleteCategory).toHaveBeenCalledWith('test-id');
  });

  it('should handle account operations correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test createAccount
    await act(async () => {
      const result = await hookResult.createAccount({ name: 'Nova Conta', type: 'corrente' });
      expect(result).toEqual({ id: 'new-acc', name: 'Nova Conta' });
    });
    expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith({ name: 'Nova Conta', type: 'corrente' });

    // Test editAccount
    await act(async () => {
      const result = await hookResult.editAccount({ id: 'test-id', name: 'Conta Atualizada' });
      expect(result).toEqual({ id: 'updated-acc' });
    });
    expect(mockAccountViewModel.updateAccount).toHaveBeenCalledWith({ id: 'test-id', name: 'Conta Atualizada' });

    // Test removeAccount
    await act(async () => {
      const result = await hookResult.removeAccount('test-id');
      expect(result).toBe(true);
    });
    expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith('test-id');
  });

  it('should handle financial summary operations correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setSelectedPeriod
    act(() => {
      hookResult.setSelectedPeriod('month');
    });
    expect(mockOperationSummaryViewModel.setSelectedPeriod).toHaveBeenCalledWith('month');

    // Test setIncludeVariableIncome
    act(() => {
      hookResult.setIncludeVariableIncome(true);
    });
    expect(mockOperationSummaryViewModel.setIncludeVariableIncome).toHaveBeenCalledWith(true);

    // Test formatCurrency
    expect(hookResult.formatCurrency(1234.56)).toBe('R$ 1234.56');

    // Test getSelectedPeriodLabel
    expect(hookResult.getSelectedPeriodLabel()).toBe('Todos os períodos');
  });

  it('should handle utility functions correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test refreshAllData
    await act(async () => {
      await hookResult.refreshAllData();
    });
    expect(mockOperationViewModel.refreshOperations).toHaveBeenCalled();
    expect(mockCategoryViewModel.refreshCategories).toHaveBeenCalled();
    expect(mockAccountViewModel.refreshAccounts).toHaveBeenCalled();

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockApplicationStore.clearError).toHaveBeenCalled();
  });

  it('should handle filter operations correctly', () => {
    let hookResult: any = null;
    
    // Mock operations with data
    mockOperationViewModel.operations = [
      { id: '1', nature: 'despesa', state: 'confirmed', category: 'Alimentação', account: 'Conta 1' },
      { id: '2', nature: 'receita', state: 'pending', category: 'Salário', account: 'Conta 2' },
    ];
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test filter by nature
    const filteredByNature = hookResult.filterOperations({ nature: 'despesa' });
    expect(filteredByNature).toHaveLength(1);
    expect(filteredByNature[0].id).toBe('1');

    // Test filter by state
    const filteredByState = hookResult.filterOperations({ state: 'pending' });
    expect(filteredByState).toHaveLength(1);
    expect(filteredByState[0].id).toBe('2');

    // Test filter by category
    const filteredByCategory = hookResult.filterOperations({ category: 'Alimentação' });
    expect(filteredByCategory).toHaveLength(1);
    expect(filteredByCategory[0].id).toBe('1');

    // Test filter by account
    const filteredByAccount = hookResult.filterOperations({ account: 'Conta 2' });
    expect(filteredByAccount).toHaveLength(1);
    expect(filteredByAccount[0].id).toBe('2');
  });

  it('should handle category and account name getters correctly', () => {
    let hookResult: any = null;
    
    // Mock data
    mockCategoryViewModel.categories = [
      { id: '1', name: 'Alimentação', type: 'expense' },
      { id: '2', name: 'Salário', type: 'income' },
      { id: '3', name: 'Transporte', type: 'expense' },
    ];
    
    mockAccountViewModel.accounts = [
      { id: '1', name: 'Conta Corrente' },
      { id: '2', name: 'Poupança' },
      { id: '3', name: 'Cartão de Crédito' },
    ];
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test getCategoryNames
    const categoryNames = hookResult.getCategoryNames();
    expect(categoryNames).toEqual(['Alimentação', 'Salário', 'Transporte']);

    // Test getCategoryNamesByType
    const expenseCategories = hookResult.getCategoryNamesByType('expense');
    expect(expenseCategories).toEqual(['Alimentação', 'Transporte']);

    const incomeCategories = hookResult.getCategoryNamesByType('income');
    expect(incomeCategories).toEqual(['Salário']);

    // Test getAccountNames
    const accountNames = hookResult.getAccountNames();
    expect(accountNames).toEqual(['Conta Corrente', 'Poupança', 'Cartão de Crédito']);
  });

  it('should handle not implemented functions correctly', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test budget functions (not implemented yet)
    await expect(hookResult.createManualBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.createAutomaticBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.updateBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.deleteBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.getBudgetPerformance()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.getHistoricalDataForBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.refreshActiveBudget()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.loadMonthlyBudgetPerformance()).rejects.toThrow('Not implemented yet');

    // Test goal functions (not implemented yet)
    await expect(hookResult.createGoal()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.updateGoal()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.deleteGoal()).rejects.toThrow('Not implemented yet');
    await expect(hookResult.getGoalById()).rejects.toThrow('Not implemented yet');
  });
});
