import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result, success, failure } from '../../../../clean-architecture/shared/utils/Result';

// Mock dos Use Cases
const mockCreateAccountUseCase = {
  execute: jest.fn(),
};

const mockUpdateAccountUseCase = {
  execute: jest.fn(),
};

const mockDeleteAccountUseCase = {
  execute: jest.fn(),
};

const mockGetAccountByIdUseCase = {
  execute: jest.fn(),
};

const mockGetAccountsUseCase = {
  execute: jest.fn(),
};

jest.mock('../../../../clean-architecture/domain/use-cases/CreateAccountUseCase', () => ({
  CreateAccountUseCase: jest.fn(() => mockCreateAccountUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/UpdateAccountUseCase', () => ({
  UpdateAccountUseCase: jest.fn(() => mockUpdateAccountUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/DeleteAccountUseCase', () => ({
  DeleteAccountUseCase: jest.fn(() => mockDeleteAccountUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetAccountByIdUseCase', () => ({
  GetAccountByIdUseCase: jest.fn(() => mockGetAccountByIdUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetAccountsUseCase', () => ({
  GetAccountsUseCase: jest.fn(() => mockGetAccountsUseCase),
}));

describe('AccountViewModel', () => {
  let accountViewModel: AccountViewModel;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockAccountRepository = {} as any;
    accountViewModel = new AccountViewModel(mockAccountRepository);
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const accountData = {
        name: 'Conta Corrente',
        type: 'corrente' as const,
        balance: new Money(1000),
        description: 'Conta principal',
        color: '#007AFF',
        isActive: true,
        isDefault: false,
      };

      const createdAccount = new Account({
        id: 'account-1',
        ...accountData,
        createdAt: new Date(),
      });

      mockCreateAccountUseCase.execute.mockResolvedValue(
        success({ account: createdAccount })
      );

      const result = await accountViewModel.createAccount(accountData);

      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        description: accountData.description,
        color: accountData.color,
      });
      expect(result).toEqual(createdAccount);
      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const accountData = {
        name: '',
        type: 'corrente' as const,
        balance: new Money(1000),
      };

      const error = new Error('Nome da conta é obrigatório');
      mockCreateAccountUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(accountViewModel.createAccount(accountData)).rejects.toThrow('Nome da conta é obrigatório');

      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBe('Nome da conta é obrigatório');
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const accountId = 'account-1';
      const updateData = {
        name: 'Conta Atualizada',
        balance: new Money(2000),
      };

      const updatedAccount = new Account({
        id: accountId,
        name: 'Conta Atualizada',
        type: 'corrente',
        balance: new Money(2000),
        createdAt: new Date(),
      });

      mockUpdateAccountUseCase.execute.mockResolvedValue(updatedAccount);

      const result = await accountViewModel.updateAccount(accountId, updateData);

      expect(mockUpdateAccountUseCase.execute).toHaveBeenCalledWith(accountId, updateData);
      expect(result).toEqual(updatedAccount);
      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBeNull();
    });

    it('should handle update error', async () => {
      const accountId = 'account-1';
      const updateData = {
        name: '',
      };

      const error = new Error('Nome da conta é obrigatório');
      mockUpdateAccountUseCase.execute.mockRejectedValue(error);

      await expect(accountViewModel.updateAccount(accountId, updateData)).rejects.toThrow('Nome da conta é obrigatório');

      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBe('Nome da conta é obrigatório');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const accountId = 'account-1';

      mockDeleteAccountUseCase.execute.mockResolvedValue(
        success({ deleted: true })
      );

      const result = await accountViewModel.deleteAccount(accountId);

      expect(mockDeleteAccountUseCase.execute).toHaveBeenCalledWith({ id: accountId });
      expect(result).toBe(true);
      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const accountId = 'account-1';

      const error = new Error('Conta não encontrada');
      mockDeleteAccountUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(accountViewModel.deleteAccount(accountId)).rejects.toThrow('Conta não encontrada');

      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBe('Conta não encontrada');
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
        createdAt: new Date(),
      });

      mockGetAccountByIdUseCase.execute.mockResolvedValue(
        success({ account })
      );

      const result = await accountViewModel.getAccountById(accountId);

      expect(mockGetAccountByIdUseCase.execute).toHaveBeenCalledWith({ id: accountId });
      expect(result).toEqual(account);
      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBeNull();
    });

    it('should handle get account error', async () => {
      const accountId = 'account-1';

      const error = new Error('Conta não encontrada');
      mockGetAccountByIdUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(accountViewModel.getAccountById(accountId)).rejects.toThrow('Conta não encontrada');

      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBe('Conta não encontrada');
    });
  });

  describe('getAllAccounts', () => {
    it('should get all accounts successfully', async () => {
      const accounts = [
        new Account({
          id: 'account-1',
          name: 'Conta Corrente',
          type: 'corrente',
          balance: new Money(1000),
          createdAt: new Date(),
        }),
        new Account({
          id: 'account-2',
          name: 'Conta Poupança',
          type: 'poupanca',
          balance: new Money(5000),
          createdAt: new Date(),
        }),
      ];

      mockGetAccountsUseCase.execute.mockResolvedValue(
        success({ accounts })
      );

      const result = await accountViewModel.getAllAccounts();

      expect(mockGetAccountsUseCase.execute).toHaveBeenCalledWith({});
      expect(result).toEqual(accounts);
      expect(accountViewModel.accounts).toEqual(accounts);
      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBeNull();
    });

    it('should handle get all accounts error', async () => {
      const error = new Error('Erro ao carregar contas');
      mockGetAccountsUseCase.execute.mockResolvedValue(
        failure(error)
      );

      await expect(accountViewModel.getAllAccounts()).rejects.toThrow('Erro ao carregar contas');

      expect(accountViewModel.loading).toBe(false);
      expect(accountViewModel.error).toBe('Erro ao carregar contas');
    });
  });

  describe('state management', () => {
    it('should set loading state during operations', async () => {
      const accountData = {
        name: 'Conta Corrente',
        type: 'corrente' as const,
        balance: new Money(1000),
      };

      const createdAccount = new Account({
        id: 'account-1',
        ...accountData,
        createdAt: new Date(),
      });

      mockCreateAccountUseCase.execute.mockResolvedValue(
        success({ account: createdAccount })
      );

      // Simulate async operation
      const createPromise = accountViewModel.createAccount(accountData);
      
      expect(accountViewModel.loading).toBe(true);
      
      await createPromise;
      
      expect(accountViewModel.loading).toBe(false);
    });

    it('should clear error when operation succeeds', async () => {
      // Set initial error
      accountViewModel.setError('Erro anterior');

      const accountData = {
        name: 'Conta Corrente',
        type: 'corrente' as const,
        balance: new Money(1000),
      };

      const createdAccount = new Account({
        id: 'account-1',
        ...accountData,
        createdAt: new Date(),
      });

      mockCreateAccountUseCase.execute.mockResolvedValue(
        success({ account: createdAccount })
      );

      await accountViewModel.createAccount(accountData);

      expect(accountViewModel.error).toBeNull();
    });
  });
});
