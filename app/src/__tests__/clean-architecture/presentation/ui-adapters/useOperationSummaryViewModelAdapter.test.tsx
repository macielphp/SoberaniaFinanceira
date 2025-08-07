import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useOperationSummaryViewModelAdapter } from '@/clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter';
import { OperationSummaryViewModel } from '@/clean-architecture/presentation/view-models/OperationSummaryViewModel';
import { container } from '@/clean-architecture/shared/di/Container';

// Mock the container
jest.mock('@/clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock OperationSummaryViewModel
jest.mock('@/clean-architecture/presentation/view-models/OperationSummaryViewModel', () => ({
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
  let mockOperationSummaryViewModel: any;

  beforeEach(() => {
    mockOperationSummaryViewModel = {
      summary: {
        totalReceitas: 0,
        totalDespesas: 0,
        saldoLiquido: 0,
        receitasPendentes: 0,
        despesasPendentes: 0,
        totalOperacoes: 0,
        operacoesPendentes: 0,
      },
      loading: false,
      error: null,
      selectedPeriod: 'all',
      includeVariableIncome: false,
      getSummary: jest.fn().mockReturnValue({
        totalReceitas: 0,
        totalDespesas: 0,
        saldoLiquido: 0,
      }),
      setSelectedPeriod: jest.fn(),
      setIncludeVariableIncome: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshSummary: jest.fn(),
    };

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
    expect(hookResult.summary).toBeDefined();
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
      'summary',
      'loading',
      'error',
      'selectedPeriod',
      'includeVariableIncome',
      'getSummary',
      'setSelectedPeriod',
      'setIncludeVariableIncome',
      'setLoading',
      'setError',
      'clearError',
      'refreshSummary'
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

    // Test refreshSummary
    act(() => {
      hookResult.refreshSummary();
    });
    expect(mockOperationSummaryViewModel.refreshSummary).toHaveBeenCalled();
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

    // Test getSummary
    act(() => {
      hookResult.getSummary();
    });
    expect(mockOperationSummaryViewModel.getSummary).toHaveBeenCalled();
  });

  it('should provide state properties from view model', () => {
    // Mock view model with specific state
    const mockSummary = {
      totalReceitas: 5000,
      totalDespesas: 3000,
      saldoLiquido: 2000,
      receitasPendentes: 1000,
      despesasPendentes: 500,
      totalOperacoes: 50,
      operacoesPendentes: 10,
    };

    const mockState = {
      summary: mockSummary,
      loading: true,
      error: 'Test error',
      selectedPeriod: 'month',
      includeVariableIncome: true,
    };

    mockOperationSummaryViewModel.summary = mockState.summary;
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

    expect(hookResult.summary).toEqual(mockState.summary);
    expect(hookResult.loading).toBe(mockState.loading);
    expect(hookResult.error).toBe(mockState.error);
    expect(hookResult.selectedPeriod).toBe(mockState.selectedPeriod);
    expect(hookResult.includeVariableIncome).toBe(mockState.includeVariableIncome);
  });

  it('should handle different periods correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

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
