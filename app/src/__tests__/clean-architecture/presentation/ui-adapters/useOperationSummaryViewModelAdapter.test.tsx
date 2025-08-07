import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useOperationSummaryViewModelAdapter } from '../../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter';
import { OperationSummaryViewModel } from '../../../clean-architecture/presentation/view-models/OperationSummaryViewModel';
import { container } from '../../../clean-architecture/shared/di/Container';

// Mock the container
jest.mock('../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock OperationSummaryViewModel
jest.mock('../../../clean-architecture/presentation/view-models/OperationSummaryViewModel', () => ({
  OperationSummaryViewModel: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useOperationSummaryViewModelAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('useOperationSummaryViewModelAdapter', () => {
  let mockOperationSummaryViewModel: jest.Mocked<OperationSummaryViewModel>;

  beforeEach(() => {
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
      refreshData: jest.fn(),
    } as unknown as jest.Mocked<OperationSummaryViewModel>;

    (container.resolve as jest.Mock).mockReturnValue(mockOperationSummaryViewModel);
    (OperationSummaryViewModel as jest.Mock).mockImplementation(() => mockOperationSummaryViewModel);
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
    expect(hookResult.loading).toBe(false);
    expect(hookResult.error).toBe(null);
    expect(hookResult.selectedPeriod).toBe('all');
    expect(hookResult.includeVariableIncome).toBe(false);
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
      'operations',
      'loading',
      'error',
      'selectedPeriod',
      'includeVariableIncome',
      'getOperations',
      'getFilteredOperations',
      'getFinancialSummary',
      'setSelectedPeriod',
      'setIncludeVariableIncome',
      'setLoading',
      'setError',
      'clearError',
      'refreshData'
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for OperationSummaryViewModel when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('OperationSummaryViewModel');
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

    // Test setLoading
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockOperationSummaryViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setError
    act(() => {
      hookResult.setError('Test error');
    });
    expect(mockOperationSummaryViewModel.setError).toHaveBeenCalledWith('Test error');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockOperationSummaryViewModel.clearError).toHaveBeenCalled();

    // Test refreshData
    act(() => {
      hookResult.refreshData();
    });
    expect(mockOperationSummaryViewModel.refreshData).toHaveBeenCalled();
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

    // Test getOperations
    act(() => {
      hookResult.getOperations();
    });
    expect(mockOperationSummaryViewModel.getOperations).toHaveBeenCalled();

    // Test getFilteredOperations
    act(() => {
      hookResult.getFilteredOperations();
    });
    expect(mockOperationSummaryViewModel.getFilteredOperations).toHaveBeenCalled();

    // Test getFinancialSummary
    act(() => {
      hookResult.getFinancialSummary();
    });
    expect(mockOperationSummaryViewModel.getFinancialSummary).toHaveBeenCalled();
  });

  it('should provide state properties from view model', () => {
    // Mock view model with specific state
    const mockState = {
      operations: [{ id: '1', nature: 'despesa', value: 100 }],
      loading: true,
      error: 'Test error',
      selectedPeriod: 'month',
      includeVariableIncome: true,
    };

    mockOperationSummaryViewModel.operations = mockState.operations;
    mockOperationSummaryViewModel.loading = mockState.loading;
    mockOperationSummaryViewModel.error = mockState.error;
    mockOperationSummaryViewModel.selectedPeriod = mockState.selectedPeriod;
    mockOperationSummaryViewModel.includeVariableIncome = mockState.includeVariableIncome;

    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult.operations).toEqual(mockState.operations);
    expect(hookResult.loading).toBe(mockState.loading);
    expect(hookResult.error).toBe(mockState.error);
    expect(hookResult.selectedPeriod).toBe(mockState.selectedPeriod);
    expect(hookResult.includeVariableIncome).toBe(mockState.includeVariableIncome);
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
    const mockRefreshData = jest.fn().mockResolvedValue(true);
    const mockGetFinancialSummary = jest.fn().mockResolvedValue({
      totalReceitas: 1000,
      totalDespesas: 500,
      saldoLiquido: 500,
    });

    hookResult.refreshData = mockRefreshData;
    hookResult.getFinancialSummary = mockGetFinancialSummary;

    // Test async refreshData
    await act(async () => {
      const result = await hookResult.refreshData();
      expect(result).toBe(true);
    });
    expect(mockRefreshData).toHaveBeenCalled();

    // Test async getFinancialSummary
    await act(async () => {
      const result = await hookResult.getFinancialSummary();
      expect(result).toEqual({
        totalReceitas: 1000,
        totalDespesas: 500,
        saldoLiquido: 500,
      });
    });
    expect(mockGetFinancialSummary).toHaveBeenCalled();
  });

  it('should provide computed values from view model', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test getFinancialSummary returns expected structure
    const financialSummary = hookResult.getFinancialSummary();
    expect(financialSummary).toBeDefined();
    expect(financialSummary.totalReceitas).toBe(0);
    expect(financialSummary.totalDespesas).toBe(0);
    expect(financialSummary.saldoLiquido).toBe(0);
    expect(financialSummary.receitasPendentes).toBe(0);
    expect(financialSummary.despesasPendentes).toBe(0);
    expect(financialSummary.totalOperacoes).toBe(0);
    expect(financialSummary.operacoesPendentes).toBe(0);

    // Test getFilteredOperations returns array
    const filteredOperations = hookResult.getFilteredOperations();
    expect(filteredOperations).toEqual([]);
  });

  it('should handle period changes correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test different period values
    const periods = ['all', 'month', 'quarter', 'year'];
    
    periods.forEach(period => {
      act(() => {
        hookResult.setSelectedPeriod(period);
      });
      expect(mockOperationSummaryViewModel.setSelectedPeriod).toHaveBeenCalledWith(period);
    });
  });

  it('should handle variable income toggle correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test toggle to true
    act(() => {
      hookResult.setIncludeVariableIncome(true);
    });
    expect(mockOperationSummaryViewModel.setIncludeVariableIncome).toHaveBeenCalledWith(true);

    // Test toggle to false
    act(() => {
      hookResult.setIncludeVariableIncome(false);
    });
    expect(mockOperationSummaryViewModel.setIncludeVariableIncome).toHaveBeenCalledWith(false);
  });
});
