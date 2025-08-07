import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useAccountViewModelAdapter } from '@/clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter';
import { AccountViewModel } from '@/clean-architecture/presentation/view-models/AccountViewModel';
import { container } from '@/clean-architecture/shared/di/Container';

// Mock the container
jest.mock('@/clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock AccountViewModel
jest.mock('@/clean-architecture/presentation/view-models/AccountViewModel', () => ({
  AccountViewModel: jest.fn(),
}));

// Component wrapper to test the hook
const TestComponent = ({ onHookResult }: { onHookResult: (result: any) => void }) => {
  const hookResult = useAccountViewModelAdapter();
  
  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
};

describe('useAccountViewModelAdapter', () => {
  let mockAccountViewModel: any;

  beforeEach(() => {
    mockAccountViewModel = {
      accounts: [],
      loading: false,
      error: null,
      selectedAccount: null,
      getAccounts: jest.fn().mockReturnValue([]),
      getAccountById: jest.fn(),
      createAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
      setSelectedAccount: jest.fn(),
      clearSelectedAccount: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      refreshAccounts: jest.fn(),
    };

    (container.resolve as jest.Mock).mockReturnValue(mockAccountViewModel);
    (AccountViewModel as jest.Mock).mockImplementation(() => mockAccountViewModel);
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
    expect(hookResult.accounts).toEqual([]);
    expect(hookResult.loading).toBe(false);
    expect(hookResult.error).toBe(null);
    expect(hookResult.selectedAccount).toBe(null);
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
      'accounts',
      'loading',
      'error',
      'selectedAccount',
      'getAccounts',
      'getAccountById',
      'createAccount',
      'updateAccount',
      'deleteAccount',
      'setSelectedAccount',
      'clearSelectedAccount',
      'setLoading',
      'setError',
      'clearError',
      'refreshAccounts'
    ];

    expectedProperties.forEach(prop => {
      expect(hookResult).toHaveProperty(prop);
    });
  });

  it('should call container.resolve for AccountViewModel when hook is used', () => {
    render(
      <TestComponent 
        onHookResult={() => {}}
      />
    );

    expect(container.resolve).toHaveBeenCalledWith('AccountViewModel');
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

    // Test createAccount
    act(() => {
      hookResult.createAccount({ name: 'Conta Corrente', type: 'corrente' });
    });
    expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith({ name: 'Conta Corrente', type: 'corrente' });

    // Test updateAccount
    act(() => {
      hookResult.updateAccount('test-id', { name: 'Conta Atualizada' });
    });
    expect(mockAccountViewModel.updateAccount).toHaveBeenCalledWith('test-id', { name: 'Conta Atualizada' });

    // Test deleteAccount
    act(() => {
      hookResult.deleteAccount('test-id');
    });
    expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith('test-id');

    // Test setSelectedAccount
    act(() => {
      hookResult.setSelectedAccount({ id: 'test-id', name: 'Conta Teste' });
    });
    expect(mockAccountViewModel.setSelectedAccount).toHaveBeenCalledWith({ id: 'test-id', name: 'Conta Teste' });

    // Test clearSelectedAccount
    act(() => {
      hookResult.clearSelectedAccount();
    });
    expect(mockAccountViewModel.clearSelectedAccount).toHaveBeenCalled();

    // Test setLoading
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockAccountViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setError
    act(() => {
      hookResult.setError('Test error');
    });
    expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Test error');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockAccountViewModel.clearError).toHaveBeenCalled();

    // Test refreshAccounts
    act(() => {
      hookResult.refreshAccounts();
    });
    expect(mockAccountViewModel.refreshAccounts).toHaveBeenCalled();
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

    // Test getAccounts
    act(() => {
      hookResult.getAccounts();
    });
    expect(mockAccountViewModel.getAccounts).toHaveBeenCalled();

    // Test getAccountById
    act(() => {
      hookResult.getAccountById('test-id');
    });
    expect(mockAccountViewModel.getAccountById).toHaveBeenCalledWith('test-id');
  });

  it('should provide state properties from view model', () => {
    // Mock view model with specific state
    const mockState = {
      accounts: [{ id: '1', name: 'Conta Corrente', type: 'corrente' }],
      loading: true,
      error: 'Test error',
      selectedAccount: { id: '1', name: 'Conta Corrente' },
    };

    mockAccountViewModel.accounts = mockState.accounts;
    mockAccountViewModel.loading = mockState.loading;
    mockAccountViewModel.error = mockState.error;
    mockAccountViewModel.selectedAccount = mockState.selectedAccount;

    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    expect(hookResult.accounts).toEqual(mockState.accounts);
    expect(hookResult.loading).toBe(mockState.loading);
    expect(hookResult.error).toBe(mockState.error);
    expect(hookResult.selectedAccount).toEqual(mockState.selectedAccount);
  });
});
