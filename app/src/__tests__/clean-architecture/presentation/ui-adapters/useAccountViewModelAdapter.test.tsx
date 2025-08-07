import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useAccountViewModelAdapter } from '../../../clean-architecture/presentation/ui-adapter/useAccountViewModelAdapter';

import { AccountViewModel } from '../../../clean-architecture/presentation/view-models/AccountViewModel';
import { container } from '../../../clean-architecture/shared/di/Container';

// Mock the container
jest.mock('../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock AccountViewModel
jest.mock('../../../clean-architecture/presentation/view-models/AccountViewModel', () => ({
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
  let mockAccountViewModel: jest.Mocked<AccountViewModel>;

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
    } as unknown as jest.Mocked<AccountViewModel>;

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
      hookResult.setSelectedAccount({ id: 'test-id', name: 'Conta Corrente' });
    });
    expect(mockAccountViewModel.setSelectedAccount).toHaveBeenCalledWith({ id: 'test-id', name: 'Conta Corrente' });

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
    const mockCreateAccount = jest.fn().mockResolvedValue({ id: 'new-id', name: 'Nova Conta' });
    const mockUpdateAccount = jest.fn().mockResolvedValue({ id: 'updated-id', name: 'Conta Atualizada' });
    const mockDeleteAccount = jest.fn().mockResolvedValue(true);
    const mockRefreshAccounts = jest.fn().mockResolvedValue([]);

    hookResult.createAccount = mockCreateAccount;
    hookResult.updateAccount = mockUpdateAccount;
    hookResult.deleteAccount = mockDeleteAccount;
    hookResult.refreshAccounts = mockRefreshAccounts;

    // Test async createAccount
    await act(async () => {
      const result = await hookResult.createAccount({ name: 'Nova Conta', type: 'corrente' });
      expect(result).toEqual({ id: 'new-id', name: 'Nova Conta' });
    });
    expect(mockCreateAccount).toHaveBeenCalledWith({ name: 'Nova Conta', type: 'corrente' });

    // Test async updateAccount
    await act(async () => {
      const result = await hookResult.updateAccount('test-id', { name: 'Conta Atualizada' });
      expect(result).toEqual({ id: 'updated-id', name: 'Conta Atualizada' });
    });
    expect(mockUpdateAccount).toHaveBeenCalledWith('test-id', { name: 'Conta Atualizada' });

    // Test async deleteAccount
    await act(async () => {
      const result = await hookResult.deleteAccount('test-id');
      expect(result).toBe(true);
    });
    expect(mockDeleteAccount).toHaveBeenCalledWith('test-id');

    // Test async refreshAccounts
    await act(async () => {
      const result = await hookResult.refreshAccounts();
      expect(result).toEqual([]);
    });
    expect(mockRefreshAccounts).toHaveBeenCalled();
  });

  it('should handle account selection correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const testAccount = { id: '1', name: 'Conta Corrente', type: 'corrente' };

    // Test setSelectedAccount
    act(() => {
      hookResult.setSelectedAccount(testAccount);
    });
    expect(mockAccountViewModel.setSelectedAccount).toHaveBeenCalledWith(testAccount);

    // Test clearSelectedAccount
    act(() => {
      hookResult.clearSelectedAccount();
    });
    expect(mockAccountViewModel.clearSelectedAccount).toHaveBeenCalled();
  });

  it('should handle account CRUD operations correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const newAccount = { name: 'Poupança', type: 'poupanca' };
    const updateData = { name: 'Poupança Atualizada' };

    // Test create
    act(() => {
      hookResult.createAccount(newAccount);
    });
    expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith(newAccount);

    // Test update
    act(() => {
      hookResult.updateAccount('test-id', updateData);
    });
    expect(mockAccountViewModel.updateAccount).toHaveBeenCalledWith('test-id', updateData);

    // Test delete
    act(() => {
      hookResult.deleteAccount('test-id');
    });
    expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith('test-id');
  });

  it('should handle error states correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setError
    act(() => {
      hookResult.setError('Erro ao carregar contas');
    });
    expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Erro ao carregar contas');

    // Test clearError
    act(() => {
      hookResult.clearError();
    });
    expect(mockAccountViewModel.clearError).toHaveBeenCalled();
  });

  it('should handle loading states correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    // Test setLoading to true
    act(() => {
      hookResult.setLoading(true);
    });
    expect(mockAccountViewModel.setLoading).toHaveBeenCalledWith(true);

    // Test setLoading to false
    act(() => {
      hookResult.setLoading(false);
    });
    expect(mockAccountViewModel.setLoading).toHaveBeenCalledWith(false);
  });

  it('should handle different account types correctly', () => {
    let hookResult: any = null;
    
    render(
      <TestComponent 
        onHookResult={(result) => {
          hookResult = result;
        }}
      />
    );

    const accountTypes = [
      { name: 'Conta Corrente', type: 'corrente' },
      { name: 'Poupança', type: 'poupanca' },
      { name: 'Cartão de Crédito', type: 'cartao_credito' },
      { name: 'Investimento', type: 'investimento' },
    ];

    accountTypes.forEach(account => {
      act(() => {
        hookResult.createAccount(account);
      });
      expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith(account);
    });
  });
});
