import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useOperationViewModelAdapter } from '@/clean-architecture/presentation/ui-adapters/useOperationViewModelAdapter';
import { OperationViewModel } from '@/clean-architecture/presentation/view-models/OperationViewModel';
import { container } from '@/clean-architecture/shared/di/Container';

// Mock the container
jest.mock('@/clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock OperationViewModel
jest.mock('@/clean-architecture/presentation/view-models/OperationViewModel', () => ({
  OperationViewModel: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useOperationViewModelAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('useOperationViewModelAdapter', () => {
  let mockOperationViewModel: any;

  beforeEach(() => {
    mockOperationViewModel = {
      operations: [],
      loading: false,
      error: null,
      selectedOperation: null,
      getOperations: jest.fn().mockReturnValue([]),
      getOperationById: jest.fn(),
      createOperation: jest.fn(),
      updateOperation: jest.fn(),
      deleteOperation: jest.fn(),
      setSelectedOperation: jest.fn(),
      clearSelectedOperation: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshOperations: jest.fn(),
    };

    (container.resolve as jest.Mock).mockReturnValue(mockOperationViewModel);
    (OperationViewModel as jest.Mock).mockImplementation(() => mockOperationViewModel);
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
    expect(hookResult.selectedOperation).toBe(null);
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
      'selectedOperation',
      'getOperations',
      'getOperationById',
      'createOperation',
      'updateOperation',
      'deleteOperation',
      'setSelectedOperation',
      'clearSelectedOperation',
      'setLoading',
      'setError',
      'clearError',
      'refreshOperations'
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for OperationViewModel when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('OperationViewModel');
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

    // Test createOperation
    act(() => {
      hookResult.createOperation({ nature: 'despesa', value: 100 });
    });
    expect(mockOperationViewModel.createOperation).toHaveBeenCalledWith({ nature: 'despesa', value: 100 });

    // Test updateOperation
    act(() => {
      hookResult.updateOperation('test-id', { value: 200 });
    });
    expect(mockOperationViewModel.updateOperation).toHaveBeenCalledWith('test-id', { value: 200 });

    // Test deleteOperation
    act(() => {
      hookResult.deleteOperation('test-id');
    });
    expect(mockOperationViewModel.deleteOperation).toHaveBeenCalledWith('test-id');

    // Test setSelectedOperation
    act(() => {
      hookResult.setSelectedOperation({ id: 'test-id', nature: 'despesa' });
    });
    expect(mockOperationViewModel.setSelectedOperation).toHaveBeenCalledWith({ id: 'test-id', nature: 'despesa' });

    // Test clearSelectedOperation
    act(() => {
      hookResult.clearSelectedOperation();
    });
    expect(mockOperationViewModel.clearSelectedOperation).toHaveBeenCalled();

    // Test setLoading
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockOperationViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setError
    act(() => {
      hookResult.setError('Test error');
    });
    expect(mockOperationViewModel.setError).toHaveBeenCalledWith('Test error');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockOperationViewModel.clearError).toHaveBeenCalled();

    // Test refreshOperations
    act(() => {
      hookResult.refreshOperations();
    });
    expect(mockOperationViewModel.refreshOperations).toHaveBeenCalled();
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
    expect(mockOperationViewModel.getOperations).toHaveBeenCalled();

    // Test getOperationById
    act(() => {
      hookResult.getOperationById('test-id');
    });
    expect(mockOperationViewModel.getOperationById).toHaveBeenCalledWith('test-id');
  });

  it('should provide state properties from view model', () => {
    // Mock view model with specific state
    const mockState = {
      operations: [{ id: '1', nature: 'despesa', value: 100 }],
      loading: true,
      error: 'Test error',
      selectedOperation: { id: '1', nature: 'despesa' },
    };

    mockOperationViewModel.operations = mockState.operations;
    mockOperationViewModel.loading = mockState.loading;
    mockOperationViewModel.error = mockState.error;
    mockOperationViewModel.selectedOperation = mockState.selectedOperation;

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
    expect(hookResult.selectedOperation).toEqual(mockState.selectedOperation);
  });
});
