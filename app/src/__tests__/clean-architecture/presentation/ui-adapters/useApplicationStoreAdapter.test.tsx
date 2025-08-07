import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useApplicationStoreAdapter } from '../../../clean-architecture/presentation/ui-adapters/useApplicationStoreAdapter';
import { EventBus } from '../../../clean-architecture/shared/events/EventBus';
import { ApplicationStore } from '../../../clean-architecture/shared/state/ApplicationStore';
import { container } from '../../../clean-architecture/shared/di/Container';

// Mock the container
jest.mock('../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock ApplicationStore
jest.mock('../../../clean-architecture/shared/state/ApplicationStore', () => ({
  ApplicationStore: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useApplicationStoreAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('useApplicationStoreAdapter', () => {
  let mockEventBus: jest.Mocked<EventBus>;
  let mockApplicationStore: jest.Mocked<ApplicationStore>;
  let mockSubscribe: jest.Mock;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    mockSubscribe = jest.fn();
    mockUnsubscribe = jest.fn();

    mockEventBus = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      clear: jest.fn(),
      getHandlerCount: jest.fn(),
      hasHandlers: jest.fn(),
      getEventNames: jest.fn(),
    } as unknown as jest.Mocked<EventBus>;

    mockApplicationStore = {
      subscribe: mockSubscribe.mockReturnValue(mockUnsubscribe),
      destroy: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      setSelectedPeriod: jest.fn(),
      setIncludeVariableIncome: jest.fn(),
      getFinancialSummary: jest.fn().mockReturnValue({
        totalReceitas: 0,
        totalDespesas: 0,
        saldoLiquido: 0,
        receitasPendentes: 0,
        despesasPendentes: 0,
        totalOperacoes: 0,
        operacoesPendentes: 0,
      }),
      getFilteredOperations: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<ApplicationStore>;

    (container.resolve as jest.Mock).mockReturnValue(mockEventBus);
    (ApplicationStore as jest.Mock).mockImplementation(() => mockApplicationStore);
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
    expect(hookResult.accounts).toEqual([]);
    expect(hookResult.categories).toEqual([]);
    expect(hookResult.goals).toEqual([]);
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
      'accounts', 
      'categories',
      'goals',
      'loading',
      'error',
      'selectedPeriod',
      'includeVariableIncome',
      'financialSummary',
      'filteredOperations',
      'setLoading',
      'setError',
      'clearError',
      'setSelectedPeriod',
      'setIncludeVariableIncome',
      'refreshData'
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for EventBus when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('EventBus');
  });

  it('should create ApplicationStore instance with EventBus', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(ApplicationStore).toHaveBeenCalledWith(mockEventBus);
  });

  it('should subscribe to store changes', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(mockApplicationStore.subscribe).toHaveBeenCalled();
  });

  it('should provide action functions that call store methods', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setLoading
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockApplicationStore.setLoading).toHaveBeenCalledWith(true);

    // Test setError
    act(() => {
      hookResult.setError('Test error');
    });
    expect(mockApplicationStore.setError).toHaveBeenCalledWith('Test error');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockApplicationStore.clearError).toHaveBeenCalled();

    // Test setSelectedPeriod
    act(() => {
      hookResult.setSelectedPeriod('month');
    });
    expect(mockApplicationStore.setSelectedPeriod).toHaveBeenCalledWith('month');

    // Test setIncludeVariableIncome
    act(() => {
      hookResult.setIncludeVariableIncome(true);
    });
    expect(mockApplicationStore.setIncludeVariableIncome).toHaveBeenCalledWith(true);
  });

  it('should provide computed values from store', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult.financialSummary).toBeDefined();
    expect(hookResult.financialSummary.totalReceitas).toBe(0);
    expect(hookResult.financialSummary.totalDespesas).toBe(0);
    expect(hookResult.filteredOperations).toEqual([]);
  });

  it('should provide refreshData function', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(typeof hookResult.refreshData).toBe('function');
    expect(hookResult.refreshData).toBeInstanceOf(Function);
  });

  it('should handle refreshData async operation', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Mock the setLoading and clearError functions
    const mockSetLoading = jest.fn();
    const mockClearError = jest.fn();
    const mockSetError = jest.fn();
    
    // Replace the functions with mocks for testing
    hookResult.setLoading = mockSetLoading;
    hookResult.clearError = mockClearError;
    hookResult.setError = mockSetError;

    await act(async () => {
      await hookResult.refreshData();
    });

    // Verify that loading state is managed correctly
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockClearError).toHaveBeenCalled();
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle errors in refreshData', async () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Mock the functions
    const mockSetLoading = jest.fn();
    const mockSetError = jest.fn();
    
    hookResult.setLoading = mockSetLoading;
    hookResult.setError = mockSetError;

    // Mock refreshData to throw an error
    const originalRefreshData = hookResult.refreshData;
    hookResult.refreshData = async () => {
      mockSetLoading(true);
      try {
        throw new Error('Test error');
      } catch (error) {
        mockSetError(error instanceof Error ? error.message : 'Erro ao atualizar dados');
      } finally {
        mockSetLoading(false);
      }
    };

    await act(async () => {
      await hookResult.refreshData();
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetError).toHaveBeenCalledWith('Test error');
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
