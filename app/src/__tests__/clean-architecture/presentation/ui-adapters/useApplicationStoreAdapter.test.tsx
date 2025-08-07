import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useApplicationStoreAdapter } from '@/clean-architecture/presentation/ui-adapters/useApplicationStoreAdapter';
import { EventBus } from '@/clean-architecture/shared/events/EventBus';
import { ApplicationStore } from '@/clean-architecture/shared/state/ApplicationStore';
import { container } from '@/clean-architecture/shared/di/Container';

// Mock the container
jest.mock('@/clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock EventBus
jest.mock('@/clean-architecture/shared/events/EventBus', () => ({
  EventBus: jest.fn(),
}));

// Mock ApplicationStore
jest.mock('@/clean-architecture/shared/state/ApplicationStore', () => ({
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
  let mockEventBus: any;
  let mockApplicationStore: any;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
    };

    mockApplicationStore = {
      getState: jest.fn().mockReturnValue({
        operations: [],
        accounts: [],
        categories: [],
        goals: [],
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      }),
      setState: jest.fn(),
      subscribe: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      getCacheManager: jest.fn(),
      setCachedData: jest.fn(),
      getCachedData: jest.fn(),
      hasCachedData: jest.fn(),
      invalidateCache: jest.fn(),
      getCacheStats: jest.fn(),
      clearCache: jest.fn(),
      stop: jest.fn(),
    };

    (container.resolve as jest.Mock).mockReturnValue(mockApplicationStore);
    (EventBus as jest.Mock).mockImplementation(() => mockEventBus);
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
      'lastUpdated',
      'setState',
      'setLoading',
      'setError',
      'clearError',
      'getCachedData',
      'setCachedData',
      'hasCachedData',
      'invalidateCache',
      'getCacheStats',
      'clearCache',
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for ApplicationStore when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('ApplicationStore');
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

    // Test setState
    act(() => {
      hookResult.setState({ loading: true });
    });
    expect(mockApplicationStore.setState).toHaveBeenCalledWith({ loading: true });

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
  });

  it('should provide cache functions that call store methods', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setCachedData
    act(() => {
      hookResult.setCachedData('test-domain', { id: '1' }, { data: 'test' });
    });
    expect(mockApplicationStore.setCachedData).toHaveBeenCalledWith('test-domain', { id: '1' }, { data: 'test' });

    // Test getCachedData
    act(() => {
      hookResult.getCachedData('test-domain', { id: '1' });
    });
    expect(mockApplicationStore.getCachedData).toHaveBeenCalledWith('test-domain', { id: '1' });

    // Test hasCachedData
    act(() => {
      hookResult.hasCachedData('test-domain', { id: '1' });
    });
    expect(mockApplicationStore.hasCachedData).toHaveBeenCalledWith('test-domain', { id: '1' });

    // Test invalidateCache
    act(() => {
      hookResult.invalidateCache('test-domain');
    });
    expect(mockApplicationStore.invalidateCache).toHaveBeenCalledWith('test-domain');

    // Test clearCache
    act(() => {
      hookResult.clearCache();
    });
    expect(mockApplicationStore.clearCache).toHaveBeenCalled();

    // Test getCacheStats
    act(() => {
      hookResult.getCacheStats();
    });
    expect(mockApplicationStore.getCacheStats).toHaveBeenCalled();
  });

  it('should provide state properties from store', () => {
    // Mock store with specific state
    const mockState = {
      operations: [{ id: '1', nature: 'despesa', value: 100 }],
      accounts: [{ id: '1', name: 'Conta Corrente' }],
      categories: [{ id: '1', name: 'Alimentação' }],
      goals: [{ id: '1', name: 'Viagem' }],
      loading: true,
      error: 'Test error',
      lastUpdated: 1234567890,
    };

    mockApplicationStore.getState.mockReturnValue(mockState);

    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult.operations).toEqual(mockState.operations);
    expect(hookResult.accounts).toEqual(mockState.accounts);
    expect(hookResult.categories).toEqual(mockState.categories);
    expect(hookResult.goals).toEqual(mockState.goals);
    expect(hookResult.loading).toBe(mockState.loading);
    expect(hookResult.error).toBe(mockState.error);
    expect(hookResult.lastUpdated).toBe(mockState.lastUpdated);
  });
});
