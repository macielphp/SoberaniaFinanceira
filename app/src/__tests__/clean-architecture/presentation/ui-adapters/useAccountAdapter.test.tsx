import { renderHook, act } from '@testing-library/react-native';
import { useAccountAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useAccountAdapter';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do AccountViewModel
const mockAccountViewModel = {
  loading: false,
  error: null as string | null,
  accounts: [] as any[],
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  getAccountById: jest.fn(),
  getAllAccounts: jest.fn(),

  setError: jest.fn(),
  clearError: jest.fn(),
  setLoading: jest.fn(),
  get isLoading() { return this.loading; },
};

jest.mock('../../../../clean-architecture/presentation/view-models/AccountViewModel', () => ({
  AccountViewModel: jest.fn(() => mockAccountViewModel),
}));

// Mock do repositório
const mockAccountRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../../../clean-architecture/data/repositories/SQLiteAccountRepository', () => ({
  SQLiteAccountRepository: jest.fn(() => mockAccountRepository),
}));

describe('useAccountAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountViewModel.loading = false;
    mockAccountViewModel.error = null;
    mockAccountViewModel.accounts = [];
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAccountAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.accounts).toEqual([]);
    });

    it('should automatically load accounts on mount', async () => {
      const accounts = [
        new Account({
          id: 'account-1',
          name: 'Conta Corrente',
          type: 'corrente' as const,
          balance: new Money(1000),
          isActive: true,
          isDefault: false,
        }),
      ];

      mockAccountViewModel.getAllAccounts.mockResolvedValue(accounts);
      mockAccountViewModel.accounts = accounts;

      const { result } = renderHook(() => useAccountAdapter());

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const accountData = {
        name: 'Nova Conta',
        type: 'poupanca' as const,
        balance: new Money(500),
        isActive: true,
        isDefault: false,
      };

      const createdAccount = new Account({
        id: 'account-2',
        ...accountData,
      });

      mockAccountViewModel.createAccount.mockResolvedValue(createdAccount);
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = null;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        await result.current.createAccount(accountData);
      });

      expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith(accountData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const accountData = {
        name: '',
        type: 'poupanca' as const,
        balance: new Money(500),
        isActive: true,
        isDefault: false,
      };

      const error = 'Nome da conta é obrigatório';
      mockAccountViewModel.createAccount.mockRejectedValue(new Error(error));
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = error;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        try {
          await result.current.createAccount(accountData);
        } catch (e) {
          // Expected error
        }
      });

      expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith(accountData);
      expect(result.current.error).toBe(error);
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const accountId = 'account-1';
      const updateData = {
        name: 'Conta Atualizada',
        balance: new Money(1500),
      };

      const updatedAccount = new Account({
        id: accountId,
        name: 'Conta Atualizada',
        type: 'corrente',
        balance: new Money(1500),
        isActive: true,
        isDefault: false,
      });

      mockAccountViewModel.updateAccount.mockResolvedValue(updatedAccount);
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = null;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        await result.current.updateAccount(accountId, updateData);
      });

      expect(mockAccountViewModel.updateAccount).toHaveBeenCalledWith(accountId, updateData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const accountId = 'account-1';
      const updateData = {
        name: '',
      };

      const error = 'Nome da conta é obrigatório';
      mockAccountViewModel.updateAccount.mockRejectedValue(new Error(error));
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = error;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        try {
          await result.current.updateAccount(accountId, updateData);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const accountId = 'account-1';

      mockAccountViewModel.deleteAccount.mockResolvedValue(true);
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = null;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        await result.current.deleteAccount(accountId);
      });

      expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith(accountId);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const accountId = 'account-1';

      const error = 'Conta não encontrada';
      mockAccountViewModel.deleteAccount.mockRejectedValue(new Error(error));
      mockAccountViewModel.loading = false;
      mockAccountViewModel.error = error;

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        try {
          await result.current.deleteAccount(accountId);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('getAccountById', () => {
    it('should get account by id successfully', async () => {
      const accountId = 'account-1';
      const account = new Account({
        id: accountId,
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        isActive: true,
        isDefault: false,
      });

      mockAccountViewModel.getAccountById.mockResolvedValue(account);

      const { result } = renderHook(() => useAccountAdapter());

      let returnedAccount;
      await act(async () => {
        returnedAccount = await result.current.getAccountById(accountId);
      });

      expect(mockAccountViewModel.getAccountById).toHaveBeenCalledWith(accountId);
      expect(returnedAccount).toEqual(account);
    });
  });



  describe('error handling', () => {
    it('should clear error', () => {
      mockAccountViewModel.error = 'Erro anterior';

      const { result } = renderHook(() => useAccountAdapter());

      act(() => {
        result.current.clearError();
      });

      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useAccountAdapter());

      act(() => {
        result.current.setError('Erro customizado');
      });

      expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Erro customizado');
    });
  });

  describe('loading state', () => {
    it('should reflect loading state from view model', () => {
      mockAccountViewModel.loading = true;

      const { result } = renderHook(() => useAccountAdapter());

      expect(result.current.loading).toBe(true);
    });

    it('should update when loading state changes', () => {
      const { result, rerender } = renderHook(() => useAccountAdapter());

      expect(result.current.loading).toBe(false);

      mockAccountViewModel.loading = true;
      rerender({});

      expect(result.current.loading).toBe(true);
    });
  });

  describe('accounts list', () => {
    it('should reflect accounts from view model', () => {
      const accounts = [
        new Account({
          id: 'account-1',
          name: 'Conta 1',
          type: 'corrente' as const,
          balance: new Money(1000),
          isActive: true,
          isDefault: false,
        }),
        new Account({
          id: 'account-2',
          name: 'Conta 2',
          type: 'poupanca',
          balance: new Money(2000),
          isActive: true,
          isDefault: false,
        }),
      ];

      mockAccountViewModel.accounts = accounts;

      const { result } = renderHook(() => useAccountAdapter());

      expect(result.current.accounts).toEqual(accounts);
    });
  });

  describe('refresh', () => {
    it('should refresh accounts list', async () => {
      const accounts = [
        new Account({
          id: 'account-1',
          name: 'Conta Corrente',
          type: 'corrente' as const,
          balance: new Money(1000),
          isActive: true,
          isDefault: false,
        }),
      ];

      mockAccountViewModel.getAllAccounts.mockResolvedValue(accounts);

      const { result } = renderHook(() => useAccountAdapter());

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });
});
