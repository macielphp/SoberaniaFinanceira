import { useCallback, useEffect, useState } from 'react';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { Account, AccountProps } from '../../domain/entities/Account';
import { container } from '../../shared/di/Container';

export function useAccountViewModelAdapter() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const viewModel = container.resolve<AccountViewModel>('AccountViewModel');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      await viewModel.loadAccounts();
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const createAccount = async (props: AccountProps) => {
    setLoading(true);
    try {
      await viewModel.createAccount(props);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (accountId: string, accountProps: Partial<AccountProps>) => {
    setLoading(true);
    try {
      await viewModel.updateAccount(accountId, accountProps);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    setLoading(true);
    try {
      await viewModel.deleteAccount(id);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAccounts = useCallback(() => {
    return viewModel.getAccounts();
  }, [viewModel]);

  const setSelectedAccountHandler = useCallback((account: Account | null) => {
    viewModel.setSelectedAccount(account);
    setSelectedAccount(account);
  }, [viewModel]);

  const clearError = useCallback(() => {
    viewModel.clearError();
    setError(null);
  }, [viewModel]);

  return {
    accounts,
    loading,
    error,
    selectedAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    loadAccounts,
    getAccounts,
    setSelectedAccount: setSelectedAccountHandler,
    clearError,
  };
}