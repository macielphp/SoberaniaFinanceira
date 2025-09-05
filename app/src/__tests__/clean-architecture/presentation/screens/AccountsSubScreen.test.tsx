// Test: AccountsSubScreen
// Responsável por testar a lógica de apresentação para gerenciamento de contas
// Integra com AccountViewModel

import { AccountsSubScreen } from '../../../../clean-architecture/presentation/screens/AccountsSubScreen';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock AccountViewModel
const mockAccountViewModel = {
  loading: false,
  error: null,
  accounts: [] as Account[],
  isLoading: false,
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  getAllAccounts: jest.fn(),
  getAccountById: jest.fn(),
  validateForm: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
  setLoading: jest.fn(),
};

// Mock Account entity
const mockAccount = new Account({
  id: 'acc-1',
  name: 'Conta Principal',
  type: 'corrente',
  balance: new Money(1000.00, 'BRL'),
  isActive: true,
  createdAt: new Date('2024-01-01'),
});

const mockAccounts = [
  mockAccount,
  new Account({
    id: 'acc-2',
    name: 'Conta Poupança',
    type: 'poupanca',
    balance: new Money(5000.00, 'BRL'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
  }),
  new Account({
    id: 'acc-3',
    name: 'Cartão de Crédito',
    type: 'cartao_credito',
    balance: new Money(500.00, 'BRL'), // Credit card balance is positive (debt)
    isActive: true,
    createdAt: new Date('2024-01-01'),
  }),
];

describe('AccountsSubScreen', () => {
  let accountsSubScreen: AccountsSubScreen;

  beforeEach(() => {
    jest.clearAllMocks();
    accountsSubScreen = new AccountsSubScreen(mockAccountViewModel as any);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      mockAccountViewModel.accounts = [];
      
      expect(accountsSubScreen.getAccounts()).toEqual([]);
      expect(accountsSubScreen.getLoading()).toBe(false);
      expect(accountsSubScreen.getError()).toBeNull();
      expect(accountsSubScreen.getShowForm()).toBe(false);
      expect(accountsSubScreen.getEditingAccount()).toBeNull();
    });

    it('should load initial data on mount', async () => {
      mockAccountViewModel.getAllAccounts.mockResolvedValue(mockAccounts);
      mockAccountViewModel.accounts = mockAccounts;

      await accountsSubScreen.onMount();

      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
      expect(accountsSubScreen.getAccounts()).toEqual(mockAccounts);
    });
  });

  describe('account management', () => {
    it('should get all accounts', () => {
      mockAccountViewModel.accounts = mockAccounts;

      const accounts = accountsSubScreen.getAccounts();

      expect(accounts).toEqual(mockAccounts);
    });

    it('should create new account', async () => {
      const accountData = {
        name: 'Nova Conta',
        type: 'corrente' as const,
        balance: new Money(0, 'BRL'),
      };

      const newAccount = new Account({
        id: 'acc-new',
        ...accountData,
        isActive: true,
        createdAt: new Date(),
      });

      mockAccountViewModel.createAccount.mockResolvedValue(newAccount);
      mockAccountViewModel.accounts = [...mockAccounts, newAccount];

      const result = await accountsSubScreen.createAccount(accountData);

      expect(result).toEqual(newAccount);
      expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith(accountData);
      expect(accountsSubScreen.getShowForm()).toBe(false);
    });

    it('should handle account creation error', async () => {
      const accountData = {
        name: 'Conta Inválida',
        type: 'corrente' as const,
        balance: new Money(0, 'BRL'),
      };

      const error = new Error('Erro ao criar conta');
      mockAccountViewModel.createAccount.mockRejectedValue(error);

      await expect(accountsSubScreen.createAccount(accountData))
        .rejects.toThrow('Erro ao criar conta');

      expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Erro ao criar conta');
    });

    it('should update existing account', async () => {
      const accountId = 'acc-1';
      const updateData = {
        name: 'Conta Principal Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500.00, 'BRL'),
      };

      const updatedAccount = new Account({
        id: accountId,
        ...updateData,
        isActive: true,
        createdAt: mockAccount.createdAt,
      });

      mockAccountViewModel.updateAccount.mockResolvedValue(updatedAccount);
      mockAccountViewModel.accounts = [updatedAccount, ...mockAccounts.slice(1)];

      const result = await accountsSubScreen.updateAccount(accountId, updateData);

      expect(result).toEqual(updatedAccount);
      expect(mockAccountViewModel.updateAccount).toHaveBeenCalledWith(accountId, updateData);
      expect(accountsSubScreen.getShowForm()).toBe(false);
      expect(accountsSubScreen.getEditingAccount()).toBeNull();
    });

    it('should handle account update error', async () => {
      const accountId = 'acc-1';
      const updateData = {
        name: 'Conta Atualizada',
        type: 'corrente' as const,
        balance: new Money(1000.00, 'BRL'),
      };

      const error = new Error('Erro ao atualizar conta');
      mockAccountViewModel.updateAccount.mockRejectedValue(error);

      await expect(accountsSubScreen.updateAccount(accountId, updateData))
        .rejects.toThrow('Erro ao atualizar conta');

      expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Erro ao atualizar conta');
    });

    it('should delete account', async () => {
      const accountId = 'acc-1';
      mockAccountViewModel.deleteAccount.mockResolvedValue(true);
      mockAccountViewModel.accounts = mockAccounts.filter(acc => acc.id !== accountId);

      const result = await accountsSubScreen.deleteAccount(accountId);

      expect(result).toBe(true);
      expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith(accountId);
    });

    it('should handle account deletion error', async () => {
      const accountId = 'acc-1';
      const error = new Error('Erro ao deletar conta');
      mockAccountViewModel.deleteAccount.mockRejectedValue(error);

      await expect(accountsSubScreen.deleteAccount(accountId))
        .rejects.toThrow('Erro ao deletar conta');

      expect(mockAccountViewModel.setError).toHaveBeenCalledWith('Erro ao deletar conta');
    });
  });

  describe('form management', () => {
    it('should show form for new account', () => {
      accountsSubScreen.showForm();

      expect(accountsSubScreen.getShowForm()).toBe(true);
      expect(accountsSubScreen.getEditingAccount()).toBeNull();
    });

    it('should show form for editing account', () => {
      accountsSubScreen.editAccount(mockAccount);

      expect(accountsSubScreen.getShowForm()).toBe(true);
      expect(accountsSubScreen.getEditingAccount()).toEqual(mockAccount);
    });

    it('should hide form', () => {
      accountsSubScreen.hideForm();

      expect(accountsSubScreen.getShowForm()).toBe(false);
      expect(accountsSubScreen.getEditingAccount()).toBeNull();
    });

    it('should cancel form editing', () => {
      accountsSubScreen.editAccount(mockAccount);
      accountsSubScreen.cancelEdit();

      expect(accountsSubScreen.getShowForm()).toBe(false);
      expect(accountsSubScreen.getEditingAccount()).toBeNull();
    });
  });

  describe('filtering and search', () => {
    beforeEach(() => {
      mockAccountViewModel.accounts = mockAccounts;
    });

    it('should filter accounts by type', () => {
      const filteredAccounts = accountsSubScreen.filterAccountsByType('corrente');

      expect(filteredAccounts).toHaveLength(1);
      expect(filteredAccounts.every((acc: Account) => acc.type === 'corrente')).toBe(true);
    });

    it('should filter accounts by type - poupanca', () => {
      const filteredAccounts = accountsSubScreen.filterAccountsByType('poupanca');

      expect(filteredAccounts).toHaveLength(1);
      expect(filteredAccounts[0].type).toBe('poupanca');
    });

    it('should search accounts by name', () => {
      const searchResults = accountsSubScreen.searchAccounts('principal');

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name.toLowerCase()).toContain('principal');
    });

    it('should return empty array for no search results', () => {
      const searchResults = accountsSubScreen.searchAccounts('inexistente');

      expect(searchResults).toHaveLength(0);
    });

    it('should get accounts by type with counts', () => {
      const accountsByType = accountsSubScreen.getAccountsByType();

      expect(accountsByType).toEqual({
        corrente: 1,
        poupanca: 1,
        investimento: 0,
        cartao_credito: 1,
        dinheiro: 0,
      });
    });
  });

  describe('validation', () => {
    it('should validate account data', () => {
      const accountData = {
        name: 'Nova Conta',
        type: 'corrente' as const,
        balance: new Money(0, 'BRL'),
      };

      const validationResult = {
        isValid: true,
        errors: {},
      };

      mockAccountViewModel.validateForm.mockReturnValue(validationResult);

      const result = accountsSubScreen.validateAccountData(accountData);

      expect(result).toEqual(validationResult);
      // The validation is now done internally, not by the ViewModel
    });

    it('should return validation errors for invalid data', () => {
      const accountData = {
        name: '',
        type: 'corrente' as const,
        balance: new Money(0, 'BRL'),
      };

      const validationResult = {
        isValid: false,
        errors: {
          name: 'Nome é obrigatório',
        },
      };

      mockAccountViewModel.validateForm.mockReturnValue(validationResult);

      const result = accountsSubScreen.validateAccountData(accountData);

      expect(result).toEqual(validationResult);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      accountsSubScreen.clearErrors();

      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should get loading state', () => {
      mockAccountViewModel.isLoading = true;

      const loading = accountsSubScreen.getLoading();

      expect(loading).toBe(true);
    });

    it('should get error state', () => {
      (mockAccountViewModel as any).error = 'Erro de teste';

      const error = accountsSubScreen.getError();

      expect(error).toBe('Erro de teste');
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      mockAccountViewModel.accounts = mockAccounts;
    });

    it('should get total accounts count', () => {
      const totalCount = accountsSubScreen.getTotalAccountsCount();

      expect(totalCount).toBe(3);
    });

    it('should get active accounts count', () => {
      const activeCount = accountsSubScreen.getActiveAccountsCount();

      expect(activeCount).toBe(3); // All accounts are active in mock data
    });

    it('should get total balance', () => {
      const totalBalance = accountsSubScreen.getTotalBalance();

      expect(totalBalance).toBe(6500.00); // 1000 + 5000 + 500
    });

    it('should get accounts statistics', () => {
      const stats = accountsSubScreen.getAccountsStatistics();

      expect(stats).toEqual({
        total: 3,
        active: 3,
        inactive: 0,
        totalBalance: 6500.00,
        byType: {
          corrente: 1,
          poupanca: 1,
          investimento: 0,
          cartao_credito: 1,
          dinheiro: 0,
        },
      });
    });
  });
});
